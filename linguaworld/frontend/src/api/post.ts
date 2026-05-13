import request from './request'

export interface Post {
  id: number
  user_id: number
  user_name: string
  user_avatar: string
  content: string
  images?: string[]
  language?: string
  likes: number
  comments_count: number
  liked?: boolean
  create_time: string
  showComments?: boolean
  comments?: Comment[]
}

export interface Comment {
  id: number
  post_id: number
  user_id: number
  user_name: string
  user_avatar: string
  content: string
  create_time: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export const getPostList = (params?: { language?: string; tag?: string; page?: number; pageSize?: number }) => {
  return request.get<ApiResponse<Post[]>>('/post/list', { params })
}

export const getPostComments = (postId: number) => {
  return request.get<ApiResponse<Comment[]>>(`/post/${postId}/comments`)
}

export const likePost = (postId: number) => {
  return request.post<ApiResponse>(`/post/${postId}/like`)
}

export const createPost = (data: { content: string; language?: string; images?: string[] }) => {
  return request.post<ApiResponse<Post>>('/post/create', data)
}

export const createComment = (postId: number, data: { content: string }) => {
  return request.post<ApiResponse<Comment>>(`/post/${postId}/comment`, data)
}
