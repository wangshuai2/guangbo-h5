import { request } from '@/utils/request'

export interface RoutePoint {
  id: number
  name: string
  description: string
  duration: number // 建议停留时间（分钟）
  image: string
}

export interface VisitRoute {
  id: number
  name: string
  description: string
  duration: number // 总时长（分钟）
  difficulty: 'easy' | 'medium' | 'hard'
  points: RoutePoint[]
  tags: string[]
}

// 获取参观路线推荐
export function getVisitRoutes(museumId: number) {
  return request.get<VisitRoute[]>(`/visit-route/${museumId}/recommend`)
}
