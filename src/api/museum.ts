import { request } from '@/utils/request'
import type { Museum, MuseumListParams, NearbyParams, PaginationResponse, Treasure } from '@/types'

// 获取博物馆列表
export function getMuseumList(params?: MuseumListParams) {
  return request.get<PaginationResponse<Museum>>('/v1/museums', { params })
}

// 获取博物馆详情
export function getMuseumDetail(id: number) {
  return request.get<Museum>(`/v1/museums/${id}`)
}

// 获取附近博物馆
export function getMuseumNearby(params: NearbyParams) {
  return request.get<{ list: Museum[] }>('/v1/museums/nearby', { params })
}

// 获取镇馆之宝
export function getMuseumTreasures(id: number) {
  return request.get<{ list: Treasure[] }>(`/v1/museums/${id}/treasures`)
}

// 收藏博物馆
export function favoriteMuseum(museumId: number) {
  return request.post('/v1/favorites', { museumId })
}

// 取消收藏
export function unfavoriteMuseum(museumId: number) {
  return request.delete(`/v1/favorites/${museumId}`)
}

// 提交评分
export function submitRating(museumId: number, score: number, comment?: string) {
  return request.post('/v1/ratings', { museumId, score, comment })
}