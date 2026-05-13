<template>
  <div class="home-page">
    <!-- 顶部区域 -->
    <header class="home-header">
      <div class="header-content">
        <div class="user-welcome">
          <h1>{{ t('home.welcome') }}, {{ userInfo?.nickname || '游客' }}</h1>
          <p>继续保持学习热情，今天也要有新的收获！</p>
        </div>

        <!-- 语种切换 -->
        <LanguageSwitch />
      </div>
    </header>

    <!-- 学习数据卡片 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon streak">🔥</div>
          <div class="stat-info">
            <span class="stat-value">{{ userInfo?.streak || 0 }}</span>
            <span class="stat-label">连续学习天数</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon words">📚</div>
          <div class="stat-info">
            <span class="stat-value">{{ userInfo?.totalWords || 0 }}</span>
            <span class="stat-label">已学单词</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon time">⏱️</div>
          <div class="stat-info">
            <span class="stat-value">{{ formatMinutes(userInfo?.totalMinutes || 0) }}</span>
            <span class="stat-label">学习时长</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon exp">⭐</div>
          <div class="stat-info">
            <span class="stat-value">{{ userInfo?.exp || 0 }}</span>
            <span class="stat-label">经验值</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 今日任务 -->
    <section class="tasks-section">
      <h2 class="section-title">今日任务</h2>
      <div class="tasks-list">
        <div
          v-for="task in dailyTasks"
          :key="task.id"
          class="task-item"
          :class="{ completed: task.completed }"
          @click="completeTask(task)"
        >
          <div class="task-checkbox">
            <el-checkbox 
              v-model="task.completed" 
              @change="handleTaskChange(task)"
              :checked="task.completed"
            >
            </el-checkbox>
          </div>
          <span class="task-title">{{ task.title }}</span>
          <span class="task-reward">+{{ task.exp }}经验</span>
        </div>
      </div>
    </section>

    <!-- 继续学习 -->
    <section v-if="currentCourse" class="continue-section">
      <h2 class="section-title">{{ t('home.continue') }}</h2>
      <div class="continue-card" @click="goToCourse">
        <div class="course-cover">
          <img :src="currentCourse.coverImage" :alt="currentCourse.title" @error="handleImageError" />
          <div class="progress-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" class="bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                class="progress"
                :stroke-dasharray="`${courseProgress * 2.83} 283`"
              />
            </svg>
            <span class="progress-text">{{ Math.round(courseProgress) }}%</span>
          </div>
        </div>
        <div class="course-info">
          <h3>{{ getCourseTitle(currentCourse) }}</h3>
          <p>{{ currentCourse.description }}</p>
          <div class="course-meta">
            <span>{{ currentCourse.totalLessons }}课时</span>
            <span>{{ currentCourse.duration }}分钟</span>
          </div>
          <el-button type="primary" @click.stop="goToCourse">继续学习</el-button>
        </div>
      </div>
    </section>

    <!-- 推荐课程 -->
    <section class="courses-section">
      <div class="section-header">
        <h2 class="section-title">推荐课程</h2>
        <el-button text @click="$router.push('/courses')">查看更多</el-button>
      </div>
      <div class="courses-grid">
        <div
          v-for="course in recommendCourses"
          :key="course.id"
          class="course-card"
          @click="goToCourseDetail(course)"
        >
          <div class="course-image">
            <img :src="course.coverImage" :alt="course.title" @error="handleImageError" />
            <div class="course-lang-badge">{{ getLanguageFlag(course.language) }}</div>
          </div>
          <div class="course-content">
            <h4>{{ course.title }}</h4>
            <p>{{ course.description }}</p>
            <div class="course-footer">
              <span class="course-level">{{ getLevelName(course.level) }}</span>
              <span class="course-students">{{ course.enrolledCount }}人学习</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-section">
      <h2 class="section-title">快捷学习</h2>
      <div class="quick-grid">
        <div class="quick-item" @click="$router.push('/vocabulary')">
          <div class="quick-icon vocabulary">📖</div>
          <span>背单词</span>
        </div>
        <div class="quick-item" @click="$router.push('/speaking')">
          <div class="quick-icon speaking">🎤</div>
          <span>口语练习</span>
        </div>
        <div class="quick-item" @click="$router.push('/speaking?type=listening')">
          <div class="quick-icon listening">🎧</div>
          <span>听力训练</span>
        </div>
        <div class="quick-item" @click="$router.push('/courses')">
          <div class="quick-icon grammar">📝</div>
          <span>语法学习</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useLanguageStore } from '@/store/language'
import LanguageSwitch from '@/components/LanguageSwitch.vue'
import { getRecommendCourses } from '@/api/course'
import type { Course } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const languageStore = useLanguageStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 翻译
const t = (key: string) => languageStore.t(key)

// 每日任务
const dailyTasks = ref([
  { id: 1, title: '背诵20个单词', exp: 20, completed: false },
  { id: 2, title: '完成1节课程', exp: 30, completed: false },
  { id: 3, title: '口语练习5分钟', exp: 25, completed: false },
  { id: 4, title: '听力训练10分钟', exp: 20, completed: false }
])

// 推荐课程
const recommendCourses = ref<Course[]>([])

// 当前学习的课程
const currentCourse = ref<Course | null>(null)

// 课程进度
const courseProgress = computed(() => {
  if (!currentCourse.value) return 0
  const progress = currentCourse.value.progress || 0
  return Math.min(progress, 100)
})

// 获取课程标题
const getCourseTitle = (course: Course) => {
  const lang = languageStore.currentLanguage
  if (lang === 'en' && course.titleEn) return course.titleEn
  if (lang === 'ja' && course.titleJa) return course.titleJa
  if (lang === 'ko' && course.titleKo) return course.titleKo
  return course.title
}

// 获取语种旗帜
const getLanguageFlag = (lang: string) => {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    ja: '🇯🇵',
    ko: '🇰🇷'
  }
  return flags[lang] || '🌐'
}

// 获取难度名称
const getLevelName = (level: string) => {
  const names: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return names[level] || level
}

// 格式化时长
const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
}

// 完成任务的处理
const handleTaskChange = (task: typeof dailyTasks.value[0]) => {
  if (task.completed) {
    userStore.addExp(task.exp)
    ElMessage.success(`完成任务，获得${task.exp}经验！`)
  }
}

// 完成每日任务
const completeTask = (task: typeof dailyTasks.value[0]) => {
  if (!task.completed) {
    task.completed = true
    handleTaskChange(task)
  }
}

// 跳转到课程详情
const goToCourseDetail = (course: Course) => {
  router.push(`/course/${course.id}`)
}

// 跳转到当前课程
const goToCourse = () => {
  if (currentCourse.value) {
    router.push(`/course/${currentCourse.value.id}`)
  }
}

// 图片加载失败处理
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = `https://via.placeholder.com/${target.width}x${target.height}?text=Course+Cover`
}

// 加载推荐课程
const loadRecommendCourses = async () => {
  try {
    const res = await getRecommendCourses(4)
    if (res.code === 200) {
      recommendCourses.value = res.data
      if (res.data.length > 0) {
        currentCourse.value = res.data[0]
      }
    }
  } catch (error) {
    console.error('加载推荐课程失败:', error)
  }
}

onMounted(() => {
  userStore.init()
  loadRecommendCourses()
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 80px;
  background: var(--bg-color);
}

.home-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-welcome {
    h1 {
      font-size: 24px;
      color: white;
      margin-bottom: 4px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
  }
}

.stats-section {
  margin-bottom: 24px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stat-card {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;

    .stat-icon {
      font-size: 32px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 20px;
        font-weight: bold;
        color: var(--text-color);
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-color-light);
      }
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tasks-section {
  margin-bottom: 24px;

  .tasks-list {
    background: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
  }

  .task-item {
    display: flex;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    transition: background 0.3s;
    gap: 12px;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &.completed {
      opacity: 0.6;

      .task-title {
        text-decoration: line-through;
        color: var(--text-color-light);
      }
    }

    .task-checkbox {
      flex-shrink: 0;
    }

    .task-title {
      flex: 1;
      font-size: 14px;
      color: var(--text-color);
      transition: all 0.3s;
    }

    .task-reward {
      color: #f59e0b;
      font-size: 12px;
      font-weight: 500;
      background: rgba(245, 158, 11, 0.1);
      padding: 4px 10px;
      border-radius: 12px;
    }
  }
}

.continue-section {
  margin-bottom: 24px;

  .continue-card {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 20px;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .course-cover {
      position: relative;
      width: 200px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .progress-ring {
        position: absolute;
        bottom: 8px;
        right: 8px;
        width: 48px;
        height: 48px;

        svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);

          circle {
            fill: none;
            stroke-width: 6;
          }

          .bg {
            stroke: rgba(255, 255, 255, 0.3);
          }

          .progress {
            stroke: #67c23a;
            stroke-linecap: round;
          }
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: bold;
          color: white;
        }
      }
    }

    .course-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      h3 {
        font-size: 18px;
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        color: var(--text-color-light);
        margin-bottom: 8px;
        flex: 1;
      }

      .course-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--text-color-light);
        margin-bottom: 12px;
      }
    }
  }
}

.courses-section {
  margin-bottom: 24px;

  .courses-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .course-card {
    background: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .course-image {
      position: relative;
      height: 120px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .course-lang-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 20px;
      }
    }

    .course-content {
      padding: 12px;

      h4 {
        font-size: 14px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      p {
        font-size: 12px;
        color: var(--text-color-light);
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .course-footer {
        display: flex;
        justify-content: space-between;
        font-size: 12px;

        .course-level {
          color: #67c23a;
        }

        .course-students {
          color: var(--text-color-light);
        }
      }
    }
  }
}

.quick-section {
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .quick-item {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05);
    }

    .quick-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    span {
      font-size: 14px;
      color: var(--text-color);
    }
  }
}
</style>
