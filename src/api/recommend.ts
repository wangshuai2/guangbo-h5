import { request } from '@/utils/request'
import type { Museum } from '@/types'

// 推荐类型定义
export interface RecommendParams {
  lat?: number
  lng?: number
  radius?: number
  limit?: number
  userId?: number
}

// 综合推荐响应
export interface TodayRecommendResponse {
  season: Museum[] // 季节推荐
  hot: Museum[] // 热门推荐
}

// 获取今日综合推荐（季节 + 热门）
export function getTodayRecommend(limit = 5) {
  return request.get<TodayRecommendResponse>('/v1/recommend/today', {
    params: { limit }
  })
}

// 获取季节推荐
export function getSeasonRecommend(limit = 5) {
  return request.get<Museum[]>('/v1/recommend/season', {
    params: { limit }
  })
}

// 获取个性化推荐（基于用户历史）
export function getPersonalizedRecommend(userId: number, limit = 5) {
  return request.get<Museum[]>('/v1/recommend/personalized', {
    params: { userId, limit }
  })
}

// 获取附近博物馆
export function getNearbyRecommend(lat: number, lng: number, radius = 5000, limit = 5) {
  return request.get<Museum[]>('/v1/recommend/nearby', {
    params: { lat, lng, radius, limit }
  })
}