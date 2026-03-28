import Mock from 'mockjs'
import {
  mockMuseums,
  getMuseumById,
  getMuseumsByProvince,
  getMuseumsByCity,
  searchMuseums,
} from './data/museums'
import {
  mockUser,
  mockUserStats,
  mockMedals,
  mockCheckins,
} from './data/users'

// 设置延迟
Mock.setup({
  timeout: '200-500',
})

// 分页辅助函数
function paginate<T>(list: T[], page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = list.slice(start, end)
  return {
    list: data,
    pagination: {
      page,
      pageSize,
      total: list.length,
      totalPages: Math.ceil(list.length / pageSize),
      hasMore: end < list.length,
    },
  }
}

// 成功响应
function success<T>(data: T, message = 'success') {
  return {
    code: 0,
    message,
    data,
    meta: {
      timestamp: Date.now(),
      requestId: `req_${Mock.Random.guid()}`,
    },
  }
}

// 错误响应
function error(code: number, message: string) {
  return {
    code,
    message,
    meta: {
      timestamp: Date.now(),
      requestId: `req_${Mock.Random.guid()}`,
    },
  }
}

// ========== 认证相关 ==========

// 微信登录
Mock.mock(/\/api\/v1\/auth\/wechat-login/, 'post', (options: any) => {
  const token = Mock.Random.guid()
  return success({
    token,
    expiresIn: 604800,
    user: mockUser,
  })
})

// 获取当前用户
Mock.mock(/\/api\/v1\/users\/me/, 'get', () => {
  return success(mockUser)
})

// ========== 博物馆相关 ==========

// 博物馆列表
Mock.mock(/\/api\/v1\/museums(\?|$)/, 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const province = url.searchParams.get('province')
  const city = url.searchParams.get('city')
  const keyword = url.searchParams.get('keyword')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20')

  let list = mockMuseums

  if (province) {
    list = getMuseumsByProvince(province)
  }
  if (city) {
    list = getMuseumsByCity(city)
  }
  if (keyword) {
    list = searchMuseums(keyword)
  }

  return success(paginate(list, page, pageSize))
})

// 博物馆详情
Mock.mock(/\/api\/v1\/museums\/\d+$/, 'get', (options: any) => {
  const match = options.url.match(/\/api\/v1\/museums\/(\d+)/)
  if (match) {
    const id = parseInt(match[1])
    const museum = getMuseumById(id)
    if (museum) {
      return success(museum)
    }
  }
  return error(10002, '博物馆不存在')
})

// 附近博物馆
Mock.mock(/\/api\/v1\/museums\/nearby/, 'get', () => {
  return success({
    list: mockMuseums.slice(0, 10).map(m => ({
      id: m.id,
      name: m.name,
      address: m.address,
      coverImage: m.coverImage,
      rating: m.rating,
      distance: Mock.Random.integer(100, 5000),
      latitude: m.latitude,
      longitude: m.longitude,
    })),
  })
})

// ========== 打卡相关 ==========

// 打卡
Mock.mock(/\/api\/v1\/checkins/, 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const museum = getMuseumById(body.museumId)

  if (!museum) {
    return error(10002, '博物馆不存在')
  }

  // 模拟随机获得勋章
  const unlockedMedals = Mock.Random.boolean() ? [mockMedals[0]] : []

  return success({
    id: Mock.Random.integer(1000, 9999),
    museumId: museum.id,
    museumName: museum.name,
    checkedAt: new Date().toISOString(),
    isNew: Mock.Random.boolean(),
    medals: unlockedMedals,
    stats: {
      ...mockUserStats,
      checkinCount: mockUserStats.checkinCount + 1,
    },
  })
})

// 打卡记录
Mock.mock(/\/api\/v1\/checkins\?/, 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const page = parseInt(url.searchParams.get('page') || '1')
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20')

  return success(paginate(mockCheckins, page, pageSize))
})

// ========== 勋章相关 ==========

// 勋章列表
Mock.mock(/\/api\/v1\/medals/, 'get', () => {
  return success({ list: mockMedals })
})

// ========== 足迹相关 ==========

// 足迹统计
Mock.mock(/\/api\/v1\/footprint\/stats/, 'get', () => {
  return success(mockUserStats)
})

// 足迹地图
Mock.mock(/\/api\/v1\/footprint\/map/, 'get', () => {
  const provinces = [...new Set(mockCheckins.map(c => c.museum.province))]
  return success({
    provinces: provinces.map(name => ({
      name,
      code: name,
      checkinCount: Mock.Random.integer(1, 10),
      museums: mockCheckins
        .filter(c => c.museum.province === name)
        .map(c => ({
          id: c.museum.id,
          name: c.museum.name,
          checkedAt: c.checkedAt,
        })),
    })),
    checkins: mockCheckins.map(c => ({
      museumId: c.museumId,
      museumName: c.museum.name,
      province: c.museum.province,
      city: c.museum.city,
      latitude: c.museum.latitude,
      longitude: c.museum.longitude,
      checkedAt: c.checkedAt,
    })),
  })
})

// ========== 收藏相关 ==========

// 添加收藏
Mock.mock(/\/api\/v1\/favorites/, 'post', () => {
  return success(null, '收藏成功')
})

// 取消收藏
Mock.mock(/\/api\/v1\/favorites\/\d+/, 'delete', () => {
  return success(null, '取消收藏成功')
})

export default Mock