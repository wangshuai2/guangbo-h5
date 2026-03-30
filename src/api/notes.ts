// 参观笔记 API
import { request } from '@/utils/request'

export interface NoteAuthor {
  id: number
  nickname: string
  avatar: string | null
}

export interface NoteMuseum {
  id: number
  name: string
  coverImage: string
}

export interface Note {
  id: number
  title: string
  content: string
  images: string[]
  tags?: string[]
  author: NoteAuthor
  museum: NoteMuseum
  likes: number
  favorites: number
  comments: number
  createdAt: string
  // 编辑时需要
  museumId?: number
  visitDate?: string
  isPublic?: boolean
  location?: {
    latitude: number
    longitude: number
    name?: string
  }
}

export interface NoteListParams {
  page?: number
  pageSize?: number
  museumId?: number
  isPublic?: boolean
}

export interface CreateNoteParams {
  museumId: number
  title: string
  content: string
  images?: string[]
  location?: {
    latitude: number
    longitude: number
    name?: string
  }
  visitDate?: string
  isPublic?: boolean
}

export interface UpdateNoteParams {
  id: number
  title?: string
  content?: string
  images?: string[]
  location?: {
    latitude: number
    longitude: number
    name?: string
  }
  visitDate?: string
  isPublic?: boolean
}

// 获取笔记列表
export function getNoteList(params?: NoteListParams) {
  return request.get<{ list: Note[]; pagination: { page: number; pageSize: number; total: number; totalPages: number; hasMore: boolean } }>('/v1/notes', { params })
}

// 获取笔记详情
export function getNoteDetail(id: number) {
  return request.get<Note>(`/v1/notes/${id}`)
}

// 创建笔记
export function createNote(params: CreateNoteParams) {
  return request.post<Note>('/v1/notes', params)
}

// 更新笔记
export function updateNote(params: UpdateNoteParams) {
  return request.put<Note>(`/v1/notes/${params.id}`, params)
}

// 删除笔记
export function deleteNote(id: number) {
  return request.delete(`/v1/notes/${id}`)
}

// 上传图片
export function uploadNoteImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ url: string }>('/v1/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 点赞笔记
export function likeNote(id: number) {
  return request.post(`/v1/notes/${id}/like`)
}

// 取消点赞
export function unlikeNote(id: number) {
  return request.delete(`/v1/notes/${id}/like`)
}

// 收藏笔记
export function favoriteNote(id: number) {
  return request.post(`/v1/notes/${id}/favorite`)
}

// 取消收藏
export function unfavoriteNote(id: number) {
  return request.delete(`/v1/notes/${id}/favorite`)
}