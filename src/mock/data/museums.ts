import Mock from 'mockjs'
import type { Museum, MuseumType } from '@/types'

const museumTypes: MuseumType[] = ['history', 'art', 'science', 'nature', 'general']
const provinces = [
  { name: '北京市', cities: ['北京市'] },
  { name: '上海市', cities: ['上海市'] },
  { name: '广东省', cities: ['广州市', '深圳市', '佛山市', '东莞市'] },
  { name: '江苏省', cities: ['南京市', '苏州市', '无锡市', '常州市'] },
  { name: '浙江省', cities: ['杭州市', '宁波市', '温州市', '绍兴市'] },
  { name: '四川省', cities: ['成都市', '绵阳市', '乐山市'] },
  { name: '陕西省', cities: ['西安市', '咸阳市', '宝鸡市'] },
  { name: '河南省', cities: ['郑州市', '洛阳市', '开封市'] },
  { name: '湖北省', cities: ['武汉市', '宜昌市', '襄阳市'] },
  { name: '湖南省', cities: ['长沙市', '张家界市', '岳阳市'] },
]

// 博物馆名称库
const museumNames = [
  '故宫博物院', '中国国家博物馆', '上海博物馆', '南京博物院', '陕西历史博物馆',
  '湖南省博物馆', '湖北省博物馆', '浙江省博物馆', '广东省博物馆', '四川博物院',
  '河南博物院', '山西博物院', '河北博物院', '山东博物馆', '安徽博物院',
  '福建博物院', '江西博物院', '云南博物馆', '贵州博物馆', '甘肃博物馆',
  '首都博物馆', '苏州博物馆', '宁波博物馆', '深圳博物馆', '广州博物馆',
  '武汉博物馆', '成都博物馆', '西安博物院', '杭州博物馆', '南京大屠杀遇难同胞纪念馆',
  '三星堆博物馆', '秦始皇兵马俑博物馆', '敦煌博物馆', '自贡恐龙博物馆', '中国丝绸博物馆',
  '中国陶瓷馆', '中国茶叶博物馆', '中国钱币博物馆', '中国印刷博物馆', '中国航空博物馆',
]

// 镇馆之宝名称
const treasureNames = [
  '清明上河图', '千里江山图', '富春山居图', '五牛图', '步辇图',
  '铜车马', '金缕玉衣', '越王勾践剑', '曾侯乙编钟', '马踏飞燕',
  '三星堆青铜面具', '翠玉白菜', '肉形石', '毛公鼎', '散氏盘',
  '莲鹤方壶', '四羊方尊', '后母戊鼎', '妇好鸮尊', '何尊',
]

// 生成博物馆数据
export function generateMuseums(count = 30): Museum[] {
  const result: Museum[] = []
  
  for (let i = 1; i <= count; i++) {
    const provinceData = provinces[Mock.Random.integer(0, provinces.length - 1)]
    const city = provinceData.cities[Mock.Random.integer(0, provinceData.cities.length - 1)]
    
    result.push({
      id: i,
      name: museumNames[Mock.Random.integer(0, museumNames.length - 1)],
      province: provinceData.name,
      city,
      address: Mock.mock('@county(true)@cword(5,10)号'),
      latitude: parseFloat(Mock.mock('@float(20, 45, 6, 6)')),
      longitude: parseFloat(Mock.mock('@float(100, 130, 6, 6)')),
      type: museumTypes[Mock.Random.integer(0, museumTypes.length - 1)],
      description: Mock.mock('@cparagraph(2, 4)'),
      coverImage: `https://picsum.photos/400/300?random=${i}`,
      isFree: Mock.Random.boolean(),
      rating: parseFloat((Mock.Random.float(1, 5) + Mock.Random.float(0, 0.9)).toFixed(1)),
      ratingCount: Mock.Random.integer(100, 50000),
      checkinCount: Mock.Random.integer(100, 100000),
      viewCount: Mock.Random.integer(1000, 1000000),
      phone: Mock.mock(/^1[3-9]\d{9}$/),
      website: Mock.mock('@url'),
      ticketInfo: ["免费", "成人票50元", "成人票30元", "成人票80元", "淡季40元，旺季60元"][Mock.Random.integer(0, 4)],
      isFavorited: Mock.Random.boolean(),
      isCheckin: Mock.Random.boolean(),
      treasures: Mock.Random.boolean() ? generateTreasures(Mock.Random.integer(1, 5)) : undefined,
    })
  }
  
  return result
}

// 生成镇馆之宝
export function generateTreasures(count = 3) {
  return Mock.mock({
    [`list|${count}`]: [{
      'id|+1': 1,
      'name|1': treasureNames,
      'description': '@cparagraph(1, 2)',
      'image': 'https://picsum.photos/300/200?random=@id',
    }],
  }).list
}

// 博物馆列表数据
export const mockMuseums = generateMuseums(50)

// 热门博物馆
export const mockHotMuseums = mockMuseums
  .sort((a, b) => b.checkinCount - a.checkinCount)
  .slice(0, 10)

// 根据ID获取博物馆
export function getMuseumById(id: number): Museum | undefined {
  return mockMuseums.find(m => m.id === id)
}

// 根据省份筛选
export function getMuseumsByProvince(province: string): Museum[] {
  return mockMuseums.filter(m => m.province === province)
}

// 根据城市筛选
export function getMuseumsByCity(city: string): Museum[] {
  return mockMuseums.filter(m => m.city === city)
}

// 搜索博物馆
export function searchMuseums(keyword: string): Museum[] {
  return mockMuseums.filter(m =>
    m.name.includes(keyword) ||
    m.province.includes(keyword) ||
    m.city.includes(keyword)
  )
}