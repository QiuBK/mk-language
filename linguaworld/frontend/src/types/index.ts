// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  nickname: string
  avatar: string
  role: 0 | 1 | 2  // 0-普通用户, 1-教师, 2-管理员
  nativeLanguage: string
  currentLanguage: string
  level: number
  exp: number
  streak: number
  totalWords: number
  totalMinutes: number
  status: number
  lastLoginAt?: string
  createTime: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  nickname?: string
}

// 课程相关类型
export interface Course {
  id: number
  title: string
  titleEn?: string
  titleJa?: string
  titleKo?: string
  description: string
  language: string
  level: string
  type: string
  coverImage: string
  videoUrl?: string
  duration: number
  price: number
  teacherId: number
  teacherName?: string
  totalLessons: number
  enrolledCount: number
  rating: number
  status: number
  createTime: string
}

export interface Chapter {
  id: number
  courseId: number
  title: string
  sortOrder: number
  lessons: Lesson[]
}

export interface Lesson {
  id: number
  chapterId: number
  title: string
  type: string
  videoUrl?: string
  duration: number
  sortOrder: number
}

// 单词相关类型
export interface Vocabulary {
  id: number
  language: string
  word: string
  pronunciation?: string
  translation: string
  example?: string
  exampleTranslation?: string
  audioUrl?: string
  level: string
}

export interface Wordbook {
  id: number
  language: string
  name: string
  description?: string
  coverImage?: string
  totalWords: number
  difficulty: string
}

// 口语相关类型
export interface SpeakingTopic {
  id: number
  language: string
  title: string
  content: string
  audioUrl?: string
  type: string
  difficulty: string
  keywords?: string[]
}

export interface SpeakingResult {
  id: number
  topicId: number
  audioUrl: string
  duration: number
  score: number
  feedback: string
  errorPoints: string[]
  createTime: string
}

// 学习进度
export interface LearningProgress {
  id: number
  userId: number
  courseId?: number
  lessonId?: number
  progressType: string
  progress: number
  status: number
  lastPosition?: number
  score?: number
}

// 成就
export interface Achievement {
  id: number
  code: string
  title: string
  description: string
  icon: string
  category: string
  requirement: number
  reward: number
  unlocked: boolean
  unlockedAt?: string
}

// 社区
export interface Post {
  id: number
  userId: number
  userName: string
  userAvatar: string
  content: string
  images?: string[]
  language?: string
  likes: number
  commentsCount: number
  liked?: boolean
  createTime: string
}

export interface Comment {
  id: number
  postId: number
  userId: number
  userName: string
  userAvatar: string
  content: string
  parentId?: number
  createTime: string
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
