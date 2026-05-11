<template>
  <div class="course-detail-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>课程详情</h1>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
    </div>

    <!-- 课程内容 -->
    <div v-else-if="course" class="course-content">
      <!-- 视频播放器 -->
      <div class="video-section" v-if="currentLesson">
        <VideoPlayer
          :video-url="currentLesson.videoUrl"
          :start-position="lastPosition"
          @time-update="handleTimeUpdate"
          @progress-save="handleProgressSave"
          @ended="handleLessonEnd"
        />
        <div class="lesson-title">{{ currentLesson.title }}</div>
      </div>

      <!-- 课程信息 -->
      <div class="info-section">
        <div class="course-header">
          <div class="course-badges">
            <span class="lang-badge">{{ getLanguageFlag(course.language) }} {{ getLanguageName(course.language) }}</span>
            <span class="level-badge" :class="course.level">{{ getLevelName(course.level) }}</span>
          </div>
          <h2>{{ course.title }}</h2>
          <div class="course-meta">
            <span><el-icon><User /></el-icon> {{ course.teacherName }}</span>
            <span><el-icon><VideoCamera /></el-icon> {{ course.totalLessons }}课时</span>
            <span><el-icon><Clock /></el-icon> {{ course.duration }}分钟</span>
          </div>
        </div>

        <!-- 课程目录 -->
        <div class="chapters-section">
          <h3>课程目录</h3>
          <el-collapse v-model="activeChapters">
            <el-collapse-item
              v-for="chapter in chapters"
              :key="chapter.id"
              :title="chapter.title"
              :name="chapter.id"
            >
              <div
                v-for="lesson in chapter.lessons"
                :key="lesson.id"
                class="lesson-item"
                :class="{ active: currentLesson?.id === lesson.id, completed: isLessonCompleted(lesson.id) }"
                @click="selectLesson(lesson)"
              >
                <div class="lesson-info">
                  <el-icon v-if="isLessonCompleted(lesson.id)" color="#67c23a"><SuccessFilled /></el-icon>
                  <el-icon v-else><VideoPlay /></el-icon>
                  <span>{{ lesson.title }}</span>
                </div>
                <span class="lesson-duration">{{ formatDuration(lesson.duration) }}</span>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <el-empty description="课程不存在" />
      <el-button type="primary" @click="$router.push('/courses')">返回课程列表</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Loading, User, VideoCamera, Clock, VideoPlay, SuccessFilled } from '@element-plus/icons-vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import { getCourseDetail, getCourseProgress, updateCourseProgress } from '@/api/course'
import type { Course, Chapter, Lesson } from '@/types'

const route = useRoute()

// 课程ID
const courseId = Number(route.params.id)

// 课程详情
const course = ref<Course | null>(null)
const chapters = ref<Chapter[]>([])
const loading = ref(false)

// 当前课时
const currentLesson = ref<Lesson | null>(null)
const lastPosition = ref(0)

// 已完成课时ID列表
const completedLessonIds = ref<number[]>([])

// 展开的章节
const activeChapters = ref<number[]>([])

// 获取语种旗帜
const getLanguageFlag = (lang: string) => {
  const flags: Record<string, string> = { en: '🇬🇧', ja: '🇯🇵', ko: '🇰🇷' }
  return flags[lang] || '🌐'
}

// 获取语种名称
const getLanguageName = (lang: string) => {
  const names: Record<string, string> = { en: '英语', ja: '日语', ko: '韩语' }
  return names[lang] || lang
}

// 获取难度名称
const getLevelName = (level: string) => {
  const names: Record<string, string> = { beginner: '初级', intermediate: '中级', advanced: '高级' }
  return names[level] || level
}

// 格式化时长
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 检查课时是否完成
const isLessonCompleted = (lessonId: number) => {
  return completedLessonIds.value.includes(lessonId)
}

// 选择课时
const selectLesson = (lesson: Lesson) => {
  currentLesson.value = lesson
}

// 时间更新
const handleTimeUpdate = (currentTime: number, duration: number) => {
  // 可以在这里更新UI
}

// 保存进度
const handleProgressSave = async (currentTime: number) => {
  if (!course.value || !currentLesson.value) return

  try {
    await updateCourseProgress(courseId, currentLesson.value.id, Math.floor(currentTime))
  } catch (error) {
    console.error('保存进度失败:', error)
  }
}

// 课时结束
const handleLessonEnd = async () => {
  if (!currentLesson.value) return

  // 标记为完成
  if (!completedLessonIds.value.includes(currentLesson.value.id)) {
    completedLessonIds.value.push(currentLesson.value.id)
  }

  // 找到下一个课时
  const allLessons = chapters.value.flatMap(c => c.lessons)
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.value?.id)

  if (currentIndex < allLessons.length - 1) {
    currentLesson.value = allLessons[currentIndex + 1]
  }
}

// 加载课程详情
const loadCourseDetail = async () => {
  loading.value = true
  try {
    const res = await getCourseDetail(courseId)
    if (res.code === 200) {
      course.value = res.data
      chapters.value = res.data.chapters || []

      // 获取学习进度
      const progressRes = await getCourseProgress(courseId)
      if (progressRes.code === 200) {
        completedLessonIds.value = [] // 可以根据实际数据设置
      }

      // 默认选中第一个课时
      if (chapters.value.length > 0 && chapters.value[0].lessons.length > 0) {
        currentLesson.value = chapters.value[0].lessons[0]
        activeChapters.value = [chapters.value[0].id]
      }
    }
  } catch (error) {
    console.error('加载课程详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCourseDetail()
})
</script>

<style scoped lang="scss">
.course-detail-page {
  min-height: 100vh;
  background: var(--bg-color);
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);

  h1 {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.course-content {
  padding-bottom: 80px;
}

.video-section {
  background: #000;

  .lesson-title {
    padding: 16px 20px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }
}

.info-section {
  padding: 20px;
}

.course-header {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;

  .course-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .lang-badge {
      padding: 4px 12px;
      background: var(--primary-color-light);
      color: var(--primary-color);
      border-radius: 20px;
      font-size: 12px;
    }

    .level-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;

      &.beginner { background: #d1fae5; color: #059669; }
      &.intermediate { background: #fef3c7; color: #d97706; }
      &.advanced { background: #fee2e2; color: #dc2626; }
    }
  }

  h2 {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .course-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 14px;
    color: var(--text-color-light);

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.chapters-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;

  h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .lesson-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    margin: 0 -12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &.active {
      background: var(--primary-color-light);
    }

    &.completed {
      .lesson-info {
        color: #67c23a;
      }
    }

    .lesson-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .lesson-duration {
      font-size: 12px;
      color: var(--text-color-light);
    }
  }
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}
</style>
