import { request } from '@/utils/request'
import type { Medal } from '@/types'

// 获取勋章列表
export function getMedalList(params?: { type?: string }) {
  return request.get<{ list: Medal[] }>('/v1/medals', { params })
}

// 获取用户勋章
export function getUserMedals() {
  return request.get<{ list: Medal[] }>('/v1/medals/user')
}
