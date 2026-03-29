import { request } from '@/utils/request'

export interface CollectionGroup {
  id: number
  name: string
  icon?: string
  count: number
  sortOrder: number
  createdAt: string
}

export interface Collection {
  id: number
  museumId: number
  museumName: string
  museumImage: string
  city: string
  province: string
  rating: number
  groupId?: number
  createdAt: string
}

// 获取收藏分组列表
export function getCollectionGroups() {
  return request.get<CollectionGroup[]>('/v1/collections/groups')
}

// 创建分组
export function createCollectionGroup(data: { name: string; icon?: string }) {
  return request.post<CollectionGroup>('/v1/collections/groups', data)
}

// 编辑分组
export function updateCollectionGroup(id: number, data: { name: string; icon?: string }) {
  return request.put<CollectionGroup>(`/v1/collections/groups/${id}`, data)
}

// 删除分组
export function deleteCollectionGroup(id: number) {
  return request.delete(`/v1/collections/groups/${id}`)
}

// 获取收藏列表
export function getCollections(params?: { groupId?: number; page?: number; size?: number }) {
  return request.get<{ list: Collection[]; total: number }>('/v1/collections', { params })
}

// 移动收藏到分组
export function moveCollectionToGroup(data: { collectionIds: number[]; groupId: number }) {
  return request.post('/v1/collections/move', data)
}

// 添加收藏
export function addToCollection(museumId: number) {
  return request.post('/v1/collections', { museumId })
}

// 取消收藏
export function removeFromCollection(museumId: number) {
  return request.delete(`/v1/collections/${museumId}`)
}
