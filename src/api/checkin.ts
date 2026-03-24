import { request } from '@/utils/request'
import type { CheckIn, CheckInResponse, PaginationResponse } from '@/types'

// 打卡
export function checkIn(data: { museumId: number; latitude: number; longitude: number; accuracy?: number }) {
  return request.post<CheckInResponse>('/v1/checkins', data)
}

// 获取打卡记录
export function getCheckinList(params?: { page?: number; pageSize?: number }) {
  return request.get<PaginationResponse<CheckIn>>('/v1/checkins', { params })
}

// 检查是否已打卡
export function checkTodayCheckin(museumId: number) {
  return request.get<{ checked: boolean }>(`/v1/checkins/check/${museumId}`)
}