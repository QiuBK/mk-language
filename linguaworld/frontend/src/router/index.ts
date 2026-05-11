import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { title: '注册', guest: true }
  },
  {
    path: '/courses',
    name: 'courses',
    component: () => import('@/views/CoursesPage.vue'),
    meta: { title: '课程中心' }
  },
  {
    path: '/course/:id',
    name: 'course-detail',
    component: () => import('@/views/CourseDetailPage.vue'),
    meta: { title: '课程详情' }
  },
  {
    path: '/vocabulary',
    name: 'vocabulary',
    component: () => import('@/views/VocabularyPage.vue'),
    meta: { title: '单词学习' }
  },
  {
    path: '/speaking',
    name: 'speaking',
    component: () => import('@/views/SpeakingPage.vue'),
    meta: { title: '口语练习' }
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('@/views/CommunityPage.vue'),
    meta: { title: '社区' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: () => import('@/views/AchievementsPage.vue'),
    meta: { title: '我的成就', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = `${to.meta.title || 'LinguaWorld'} - LinguaWorld`

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录用户访问登录/注册页
  if (to.meta.guest && userStore.isLoggedIn) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
