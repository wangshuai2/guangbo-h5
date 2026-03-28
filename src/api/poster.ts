import { request } from '@/utils/request'
import type { PosterData, ShareRecord } from '@/types/poster'

// 获取用户海报数据
export function getPosterData() {
  return request.get<PosterData>('/poster/user-data')
}

// 记录分享行为
export function createShare(data: { type: string; channel: string; refId?: string }) {
  return request.post<ShareRecord>('/shares', data)
}

// 获取我的分享列表
export function getMyShares(params?: { page?: number; pageSize?: number }) {
  return request.get<{ list: ShareRecord[] }>('/shares/me', { params })
}