import { request } from '@/utils/request'

export interface NavigationLinks {
  amap: {
    web: string
    app: string
    ios: string
  }
  baidu: {
    web: string
    app: string
  }
  tencent: {
    web: string
    app: string
  }
  apple: string
  google: string
}

export interface NavigationData {
  museum: {
    id: number
    name: string
    address: string
    latitude: number
    longitude: number
  }
  distance: number | null
  estimatedTime: string | null
  navigationLinks: NavigationLinks
}

// 获取博物馆导航信息
export function getMuseumNavigation(museumId: number) {
  return request.get<NavigationData>(`/navigation/museums/${museumId}`)
}
