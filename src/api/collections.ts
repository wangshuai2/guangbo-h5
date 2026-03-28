import { request } from '@/utils/request'
import type { Museum, PaginationResponse, ApiResponse } from '@/types'

// 收藏分组
export interface CollectionGroup {
  id: number
  name: string
  icon?: string
  count: number
  sort: number
  createdAt: string
}

// 收藏项（带分组信息）
export interface CollectionItem {
  id: number
  museum: Museum
  groupId?: number
  group?: CollectionGroup
  createdAt: string
}

// 获取收藏分组列表
export function getCollectionGroups() {
  return request.get<CollectionGroup[]>('/collections/groups')
}

// 创建收藏分组
export function createCollectionGroup(data: { name: string; icon?: string }) {
  return request.post<CollectionGroup>('/collections/groups', data)
}

// 编辑收藏分组
export function updateCollectionGroup(id: number, data: { name: string; icon?: string }) {
  return request.put<CollectionGroup>(`/collections/groups/${id}`, data)
}

// 删除收藏分组
export function deleteCollectionGroup(id: number) {
  return request.delete<ApiResponse>(`/collections/groups/${id}`)
}

// 获取收藏列表（可按分组筛选）
export function getCollections(params?: { groupId?: number; page?: number; pageSize?: number }) {
  return request.get<PaginationResponse<CollectionItem>>('/collections', { params })
}

// 移动收藏到分组
export function moveCollectionsToGroup(data: { ids: number[]; groupId: number }) {
  return request.post<ApiResponse>('/collections/move', data)
}

// 从分组中移除收藏
export function removeFromGroup(collectionIds: number[]) {
  return request.post<ApiResponse>('/collections/remove-from-group', { ids: collectionIds })
}
