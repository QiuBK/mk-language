import request from './request'
import type { ApiResponse, Vocabulary, Wordbook } from '@/types'

// 获取单词列表
export const getVocabularyList = (params: {
  language: string
  level?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: Vocabulary[]; total: number }>> => {
  return request.get('/vocabulary/list', { params })
}

// 获取单词本列表
export const getWordbookList = (params: {
  language: string
}): Promise<ApiResponse<Wordbook[]>> => {
  return request.get('/wordbook/list', { params })
}

// 获取单词本单词
export const getWordbookWords = (wordbookId: number): Promise<ApiResponse<Vocabulary[]>> => {
  return request.get(`/wordbook/${wordbookId}/words`)
}

// 学习单词（标记状态）
export const markWordStatus = (wordId: number, status: 0 | 1 | 2): Promise<ApiResponse> => {
  return request.post('/vocabulary/mark', { wordId, status })
}

// 获取用户单词学习进度
export const getWordProgress = (language: string): Promise<ApiResponse<{
  total: number
  mastered: number
  learning: number
  forgot: number
}>> => {
  return request.get('/vocabulary/progress', { params: { language } })
}

// 获取错题本
export const getWrongWords = (language: string): Promise<ApiResponse<Vocabulary[]>> => {
  return request.get('/vocabulary/wrong')
}

// 随机获取待学习单词
export const getRandomWords = (language: string, count: number = 20): Promise<ApiResponse<Vocabulary[]>> => {
  return request.get('/vocabulary/random', { params: { language, count } })
}
