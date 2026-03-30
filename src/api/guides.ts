import { request } from '@/utils/request'

export interface Guide {
  id: number
  title: string
  content: string
  coverImage: string
  author: { id: number; nickname: string; avatar: string | null }
  museumId?: number
  museumName?: string
  tags: string[]
  likes: number
  views: number
  comments: number
  isFeatured: boolean
  createdAt: string
}

export function getGuideList(params?: any) {
  return request.get('/v1/guides', { params })
}

export function getGuideDetail(id: number) {
  return request.get('/v1/guides/' + id)
}

export function getFeaturedGuides() {
  return request.get('/v1/guides/featured')
}

export function likeGuide(id: number) {
  return request.post('/v1/guides/' + id + '/like')
}
