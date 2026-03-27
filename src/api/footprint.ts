import { request } from '@/utils/request'
import type { UserStats, FootprintMap } from '@/types'

// 获取足迹统计
export function getFootprintStats() {
  return request.get<UserStats>('/v1/footprint/stats')
}

// 获取足迹地图数据
export function getFootprintMap() {
  return request.get<FootprintMap>('/v1/footprint/map')
}
