import { request } from '@/utils/request'

export interface CrowdData {
  currentLevel: number // 1-5，1=空闲，5=拥挤
  currentCount: number
  maxCapacity: number
  waitTime: number // 预计等待时间（分钟）
  trend: 'up' | 'down' | 'stable'
  peakHours: string[]
  bestVisitTime: string
  updateTime: string
}

// 获取实时人流
export function getCrowdFlow(museumId: number) {
  return request.get<CrowdData>(`/crowd-flow/${museumId}`)
}
