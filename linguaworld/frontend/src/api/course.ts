import request from './request'
import type { ApiResponse, Course, Chapter } from '@/types'

// 获取课程列表
export const getCourseList = (params: {
  language?: string
  level?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: Course[]; total: number }>> => {
  return request.get('/course/list', { params })
}

// 获取课程详情
export const getCourseDetail = (id: number): Promise<ApiResponse<Course & { chapters: Chapter[] }>> => {
  return request.get(`/course/${id}`)
}

// 获取推荐课程
export const getRecommendCourses = (limit?: number): Promise<ApiResponse<Course[]>> => {
  return request.get('/course/recommend', { params: { limit } })
}

// 报名课程
export const enrollCourse = (courseId: number): Promise<ApiResponse> => {
  return request.post('/course/enroll', { courseId })
}

// 获取用户报名的课程
export const getMyCourses = (): Promise<ApiResponse<Course[]>> => {
  return request.get('/course/my')
}

// 获取课程学习进度
export const getCourseProgress = (courseId: number): Promise<ApiResponse<{
  progress: number
  completedLessons: number
  totalLessons: number
}>> => {
  return request.get(`/course/${courseId}/progress`)
}

// 更新课程学习进度
export const updateCourseProgress = (courseId: number, lessonId: number, position: number): Promise<ApiResponse> => {
  return request.post('/course/progress', { courseId, lessonId, position })
}
