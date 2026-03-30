// 展品详情 API
import { request } from '@/utils/request'

export interface Exhibit {
  id: number
  museumId: number
  museumName: string
  name: string
  description: string
  image: string
  images?: string[]
  period: string  // 年代
  category: string // 分类
  size?: string    // 尺寸
  material?: string // 材质
  audio?: string   // 语音讲解
  video?: string   // 视频介绍
  likes: number
  views: number
  isFeatured: boolean
  createdAt: string
}

export interface ExhibitListParams {
  museumId?: number
  category?: string
  page?: number
  pageSize?: number
}

// 获取展品列表
export function getExhibitList(params?: ExhibitListParams) {
  return request.get<{ list: Exhibit[]; pagination: { page: number; pageSize: number; total: number; hasMore: boolean } }>('/v1/exhibits', { params })
}

// 获取展品详情
export function getExhibitDetail(id: number) {
  return request.get<Exhibit>(`/v1/exhibits/${id}`)
}

// 获取博物馆镇馆之宝
export function getMuseumTreasures(museumId: number) {
  return request.get<{ list: Exhibit[] }>(`/v1/museums/${museumId}/treasures`)
}

// 点赞展品
export function likeExhibit(id: number) {
  return request.post(`/v1/exhibits/${id}/like`)
}

// 获取展品分类
export function getExhibitCategories() {
  return request.get<{ categories: string[] }>('/v1/exhibits/categories')
}
