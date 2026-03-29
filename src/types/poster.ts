// 海报相关类型定义

export interface PosterUser {
  nickname: string
  avatar: string
  level: number
  title: string
}

export interface PosterStats {
  totalMuseums: number
  totalProvinces: number
  totalCities: number
}

export interface PosterMedal {
  name: string
  icon: string
  unlockedAt: string
}

export interface PosterMuseum {
  name: string
  city: string
  checkedAt: string
}

export interface PosterData {
  user: PosterUser
  stats: PosterStats
  provinceMap: Record<string, boolean>
  medals: PosterMedal[]
  recentMuseums: PosterMuseum[]
  qrCode: string
}

export interface ShareRecord {
  id: number
  type: string
  channel: string
  refId?: string
  createdAt: string
}

// 海报模板类型
export type PosterTemplateType = 'simple' | 'chinese' | 'modern'

// 海报生成配置
export interface PosterConfig {
  template: PosterTemplateType
  width: number
  height: number
  backgroundColor: string
  textColor: string
}