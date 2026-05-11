import request from './request'
import type { ApiResponse, User, LoginParams, RegisterParams } from '@/types'

// 用户登录
export const login = (params: LoginParams): Promise<ApiResponse<{ token: string; userInfo: User }>> => {
  return request.post('/user/login', params)
}

// 用户注册
export const register = (params: RegisterParams): Promise<ApiResponse> => {
  return request.post('/user/register', params)
}

// 获取用户信息
export const getUserInfo = (): Promise<ApiResponse<User>> => {
  return request.get('/user/info')
}

// 更新用户信息
export const updateUserInfo = (params: Partial<User>): Promise<ApiResponse> => {
  return request.put('/user/info', params)
}

// 修改密码
export const changePassword = (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
  return request.post('/user/changePassword', { oldPassword, newPassword })
}

// 获取学习统计
export const getLearningStats = (): Promise<ApiResponse<{
  streak: number
  totalWords: number
  totalMinutes: number
  courseCount: number
  speakingCount: number
}>> => {
  return request.get('/user/stats')
}
