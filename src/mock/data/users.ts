import Mock from 'mockjs'
import type { User, UserStats, Medal, CheckIn } from '@/types'
import { mockMuseums } from './museums'

// 生成用户数据
export function generateUser(): User {
  return Mock.mock({
    id: '@id',
    nickname: '@cname',
    avatar: 'https://picsum.photos/100/100?random=@id',
    'level|1-10': 1,
    'exp|0-1000': 1,
    'medalCount|0-20': 1,
    'checkinCount|0-100': 1,
    'provinceCount|1-34': 1,
    createdAt: '@datetime',
  })
}

// 生成用户统计
export function generateUserStats(): UserStats {
  return Mock.mock({
    'checkinCount|0-100': 1,
    'museumCount|0-100': 1,
    'provinceCount|1-34': 1,
    'cityCount|1-100': 1,
    provinces: ['北京市', '上海市', '广东省', '江苏省', '浙江省'],
    'medalCount|0-20': 1,
    'exp|0-1000': 1,
    'level|1-10': 1,
  })
}

// 勋章数据
export const mockMedals: Medal[] = [
  {
    id: 1,
    code: 'B001',
    name: '初探者',
    description: '打卡第1个博物馆',
    type: 'checkin',
    icon: '/medals/b001.png',
    rarity: 'common',
    expReward: 10,
    isUnlocked: true,
    unlockedAt: '2024-03-23T10:30:00Z',
    progress: { current: 1, target: 1 },
  },
  {
    id: 2,
    code: 'B002',
    name: '探索家',
    description: '打卡10个博物馆',
    type: 'checkin',
    icon: '/medals/b002.png',
    rarity: 'rare',
    expReward: 50,
    isUnlocked: false,
    progress: { current: 5, target: 10 },
  },
  {
    id: 3,
    code: 'B003',
    name: '博物馆达人',
    description: '打卡50个博物馆',
    type: 'checkin',
    icon: '/medals/b003.png',
    rarity: 'epic',
    expReward: 200,
    isUnlocked: false,
    progress: { current: 5, target: 50 },
  },
  {
    id: 4,
    code: 'P001',
    name: '城市行者',
    description: '解锁5个省份',
    type: 'province',
    icon: '/medals/p001.png',
    rarity: 'rare',
    expReward: 100,
    isUnlocked: false,
    progress: { current: 3, target: 5 },
  },
  {
    id: 5,
    code: 'P002',
    name: '全国漫游',
    description: '解锁20个省份',
    type: 'province',
    icon: '/medals/p002.png',
    rarity: 'legendary',
    expReward: 500,
    isUnlocked: false,
    progress: { current: 3, target: 20 },
  },
]

// 生成打卡记录
export function generateCheckins(count = 10): CheckIn[] {
  const checkedMuseums = mockMuseums.slice(0, count)
  return checkedMuseums.map((museum, index) => ({
    id: index + 1,
    museumId: museum.id,
    museum,
    checkedAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
  }))
}

export const mockUser = generateUser()
export const mockUserStats = generateUserStats()
export const mockCheckins = generateCheckins(15)