<template>
  <div class="courses-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>课程中心</h1>
    </header>

    <!-- 筛选器 -->
    <div class="filters">
      <div class="filter-group">
        <span class="filter-label">语种：</span>
        <el-radio-group v-model="filters.language" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="en">🇬🇧 英语</el-radio-button>
          <el-radio-button label="ja">🇯🇵 日语</el-radio-button>
          <el-radio-button label="ko">🇰🇷 韩语</el-radio-button>
        </el-radio-group>
      </div>

      <div class="filter-group">
        <span class="filter-label">难度：</span>
        <el-radio-group v-model="filters.level" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="beginner">初级</el-radio-button>
          <el-radio-button label="intermediate">中级</el-radio-button>
          <el-radio-button label="advanced">高级</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 课程列表 -->
    <div class="courses-container">
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      </div>

      <div v-else-if="courses.length === 0" class="empty-container">
        <el-empty description="暂无课程" />
      </div>

      <div v-else class="courses-grid">
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          @click="goToCourseDetail(course)"
        >
          <div class="course-image">
            <img :src="course.coverImage" :alt="course.title" />
            <div class="course-lang-badge">{{ getLanguageFlag(course.language) }}</div>
            <div class="course-type-badge">{{ getTypeName(course.type) }}</div>
          </div>

          <div class="course-content">
            <h3>{{ course.title }}</h3>
            <p class="course-description">{{ course.description }}</p>

            <div class="course-meta">
              <span class="level-badge" :class="course.level">
                {{ getLevelName(course.level) }}
              </span>
              <span class="students">
                <el-icon><User /></el-icon>
                {{ course.enrolledCount }}
              </span>
              <span class="rating">
                <el-icon color="#f59e0b"><Star /></el-icon>
                {{ course.rating }}
              </span>
            </div>

            <div class="course-footer">
              <span class="price" v-if="course.price > 0">¥{{ course.price }}</span>
              <span class="price free" v-else>免费</span>
              <el-button type="primary" size="small" @click.stop="handleEnroll(course)">
                {{ isEnrolled(course.id) ? '继续学习' : '立即报名' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Loading, User, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCourseList, enrollCourse } from '@/api/course'
import { useUserStore } from '@/store/user'
import type { Course } from '@/types'

const router = useRouter()
const userStore = useUserStore()

// 筛选条件
const filters = reactive({
  language: '',
  level: ''
})

// 课程列表
const courses = ref<Course[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 已报名课程ID列表
const enrolledCourseIds = ref<number[]>([])

// 获取语种旗帜
const getLanguageFlag = (lang: string) => {
  const flags: Record<string, string> = { en: '🇬🇧', ja: '🇯🇵', ko: '🇰🇷' }
  return flags[lang] || '🌐'
}

// 获取难度名称
const getLevelName = (level: string) => {
  const names: Record<string, string> = {
    beginner: '初级', intermediate: '中级', advanced: '高级'
  }
  return names[level] || level
}

// 获取类型名称
const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    video: '视频课', live: '直播课', private: '一对一'
  }
  return names[type] || '视频课'
}

// 检查是否已报名
const isEnrolled = (courseId: number) => {
  return enrolledCourseIds.value.includes(courseId)
}

// 加载课程列表
const loadCourses = async () => {
  loading.value = true
  try {
    const res = await getCourseList({
      language: filters.language || undefined,
      level: filters.level || undefined,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      courses.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('加载课程失败:', error)
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadCourses()
}

// 分页变化
const handlePageChange = () => {
  loadCourses()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转到课程详情
const goToCourseDetail = (course: Course) => {
  router.push(`/course/${course.id}`)
}

// 报名课程
const handleEnroll = async (course: Course) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (isEnrolled(course.id)) {
    goToCourseDetail(course)
    return
  }

  try {
    const res = await enrollCourse(course.id)
    if (res.code === 200) {
      enrolledCourseIds.value.push(course.id)
      ElMessage.success('报名成功')
      goToCourseDetail(course)
    }
  } catch (error) {
    console.error('报名失败:', error)
    ElMessage.error('报名失败，请重试')
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped lang="scss">
.courses-page {
  min-height: 100vh;
  background: var(--bg-color);
  padding-bottom: 80px;
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

.filters {
  padding: 16px 20px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);

  .filter-group {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .filter-label {
      font-size: 14px;
      color: var(--text-color-light);
      margin-right: 8px;
    }
  }
}

.courses-container {
  padding: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.course-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  .course-image {
    position: relative;
    height: 160px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .course-lang-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      font-size: 24px;
    }

    .course-type-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  .course-content {
    padding: 16px;

    h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .course-description {
      font-size: 13px;
      color: var(--text-color-light);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 12px;
      min-height: 40px;
    }

    .course-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .level-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;

        &.beginner { background: #d1fae5; color: #059669; }
        &.intermediate { background: #fef3c7; color: #d97706; }
        &.advanced { background: #fee2e2; color: #dc2626; }
      }

      .students, .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--text-color-light);
      }
    }

    .course-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price {
        font-size: 18px;
        font-weight: bold;
        color: #ef4444;

        &.free {
          color: #67c23a;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>
