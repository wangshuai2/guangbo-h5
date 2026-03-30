// 博物馆类型
export interface Museum {
  id: number
  name: string
  province: string
  city: string
  district?: string
  address: string
  latitude: number
  longitude: number
  type: MuseumType
  description?: string
  coverImage: string
  openTime?: OpenTime
  ticketInfo?: string
  isFree: boolean
  phone?: string
  website?: string
  rating: number
  ratingCount: number
  checkinCount: number
  viewCount?: number
  isFavorited?: boolean
  isCheckin?: boolean
  distance?: number
  treasures?: Treasure[]
}

export type MuseumType = 'history' | 'art' | 'science' | 'nature' | 'general'

export interface OpenTime {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

export interface Treasure {
  id: number
  name: string
  description: string
  image: string
}

// 打卡记录
export interface CheckIn {
  id: number
  museumId: number
  museum: Museum
  checkedAt: string
  latitude?: number
  longitude?: number
}

// 打卡响应
export interface CheckInResponse {
  id: number
  museumId: number
  museumName: string
  checkedAt: string
  isNew: boolean
  medals: Medal[]
  stats: UserStats
}

// 用户信息
export interface User {
  id: number
  nickname: string
  avatar: string
  level: number
  exp: number
  medalCount: number
  checkinCount: number
  provinceCount?: number
  createdAt?: string
}

// 用户统计
export interface UserStats {
  checkinCount: number
  museumCount: number
  provinceCount: number
  cityCount: number
  provinces: string[]
  medalCount: number
  exp: number
  level: number
}

// 勋章
export interface Medal {
  id: number
  code: string
  name: string
  description: string
  type: MedalType
  icon: string
  rarity: MedalRarity
  expReward: number
  isUnlocked?: boolean
  unlockedAt?: string
  progress?: {
    current: number
    target: number
  }
}

export type MedalType = 'checkin' | 'province' | 'special' | 'social'
export type MedalRarity = 'common' | 'rare' | 'epic' | 'legendary'

// 收藏
export interface Favorite {
  id: number
  museum: Museum
  createdAt: string
}

// 评分
export interface Rating {
  id: number
  museumId: number
  score: number
  comment?: string
  createdAt: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// API 响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
  meta?: {
    timestamp: number
    requestId: string
  }
}

// 博物馆列表参数
export interface MuseumListParams extends PaginationParams {
  province?: string
  city?: string
  type?: MuseumType
  isFree?: boolean
  rating?: number
  lat?: number
  lng?: number
  distance?: number
  keyword?: string
  sort?: 'rating' | 'checkin' | 'distance'
}

// 附近博物馆参数
export interface NearbyParams {
  lat: number
  lng: number
  distance?: number
  limit?: number
}

// 图形验证码参数
export interface CaptchaParams {
  lot_number: string
  captcha_output: string
  pass_token: string
  gen_time: string
}

// 登录参数
export interface LoginParams {
  code: string
  userInfo?: {
    nickname: string
    avatar: string
  }
  /** 图形验证码验证结果，用于后端二次校验 */
  captcha?: CaptchaParams
}

// 登录响应
export interface LoginResponse {
  token: string
  expiresIn: number
  user: User
}

// 足迹地图数据
export interface FootprintMap {
  provinces: Array<{
    name: string
    code: string
    checkinCount: number
    museums: Array<{
      id: number
      name: string
      checkedAt: string
    }>
  }>
  checkins: Array<{
    museumId: number
    museumName: string
    province: string
    city: string
    latitude: number
    longitude: number
    checkedAt: string
  }>
}

// 评论/评价
export interface Review {
  id: number
  userId: number
  userNickname: string
  userAvatar: string
  museumId: number
  score: number
  content: string
  images?: string[]
  likes: number
  isLiked: boolean
  createdAt: string
}

// 用户等级信息
export interface UserLevel {
  level: number
  exp: number
  nextLevelExp: number
  title: string
  privileges: string[]
}

// 签到记录
export interface SignInRecord {
  id: number
  date: string
  reward: SignInReward
}

export interface SignInReward {
  type: 'exp' | 'medal' | 'coupon'
  value: number
  name: string
}

// 收藏分组
export interface CollectionGroup {
  id: number
  name: string
  icon: string
  count: number
  createdAt: string
}

// 参观路线
export interface VisitRoute {
  id: number
  name: string
  description: string
  duration: number
  highlights: string[]
  items: RouteItem[]
}

export interface RouteItem {
  id: number
  name: string
  type: 'exhibit' | 'hall' | 'facility'
  duration: number
  description: string
}