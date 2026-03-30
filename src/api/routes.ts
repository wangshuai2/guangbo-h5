// 参观路线 API
import { request } from '@/utils/request'

export interface VisitRoute {
  id: number
  museumId: number
  museumName: string
  museumCover: string
  name: string
  description: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  highlights: string[]
  stops: RouteStop[]
  likes: number
  views: number
  isOfficial: boolean
}

export interface RouteStop {
  id: number
  exhibitId: number
  exhibitName: string
  exhibitImage: string
  hall: string
  description: string
  duration: number
  order: number
}

export function getRouteList(params?: any) {
  return request.get('/v1/visit-route', { params })
}

export function getRouteDetail(id: number) {
  return request.get(`/v1/visit-route/${id}`)
}

export function getMuseumRoutes(museumId: number) {
  return request.get(`/v1/visit-route/museum/${museumId}`)
}

export function likeRoute(id: number) {
  return request.post(`/v1/visit-route/${id}/like`)
}
