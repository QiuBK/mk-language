import request from './request'
import type { ApiResponse, SpeakingTopic, SpeakingResult } from '@/types'

// 获取口语题目列表
export const getSpeakingTopics = (params: {
  language: string
  difficulty?: string
  type?: string
}): Promise<ApiResponse<SpeakingTopic[]>> => {
  return request.get('/speaking/topics', { params })
}

// 获取随机口语题目
export const getRandomTopic = (language: string): Promise<ApiResponse<SpeakingTopic>> => {
  return request.get('/speaking/random', { params: { language } })
}

// 提交口语录音
export const submitSpeaking = (params: {
  topicId: number
  audioBlob: Blob
  duration: number
}): Promise<ApiResponse<SpeakingResult>> => {
  const formData = new FormData()
  formData.append('topicId', String(params.topicId))
  formData.append('audio', params.audioBlob)
  formData.append('duration', String(params.duration))

  return request.post('/speaking/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取口语练习历史
export const getSpeakingHistory = (params: {
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: SpeakingResult[]; total: number }>> => {
  return request.get('/speaking/history', { params })
}

// 获取口语录音文件URL
export const getSpeakingAudioUrl = (resultId: number): Promise<ApiResponse<{ url: string }>> => {
  return request.get(`/speaking/${resultId}/audio`)
}
