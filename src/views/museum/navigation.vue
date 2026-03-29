<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showDialog } from 'vant'
import NavigationCard from '@/components/NavigationCard.vue'
import { getMuseumNavigation } from '@/api/navigation'
import type { NavigationData } from '@/api/navigation'

const route = useRoute()
const router = useRouter()

const museumId = computed(() => Number(route.params.id))

const museum = ref<NavigationData['museum']>({
  id: 0,
  name: '',
  address: '',
  latitude: 0,
  longitude: 0
})

const navigationLinks = ref<NavigationData['navigationLinks'] | null>(null)

const userLocation = ref({
  latitude: 0,
  longitude: 0
})

const loading = ref(false)

// 导航链接数据

// 获取博物馆导航信息
async function fetchMuseumInfo() {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const res = await getMuseumNavigation(museumId.value)
    if (res.code === 0 && res.data) {
      museum.value = res.data.museum
      navigationLinks.value = res.data.navigationLinks
    } else {
      showToast('博物馆信息不存在')
      router.back()
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 获取用户位置
function getUserLocation() {
  return new Promise<void>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        resolve()
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  })
}

// 处理导航
async function handleNavigate(type: 'amap' | 'bmap' | 'qqmap') {
  try {
    // 尝试获取用户位置
    await getUserLocation()

    // 计算距离
    const distance = calculateDistance(
      userLocation.value.latitude,
      userLocation.value.longitude,
      museum.value.latitude,
      museum.value.longitude
    )

    // 显示确认对话框
    showDialog({
      title: '开始导航',
      message: `距离：${formatDistance(distance)}\n预计时间：${estimateTime(distance)}`,
      showCancelButton: true,
      confirmButtonText: '开始导航',
      cancelButtonText: '取消'
    }).then(() => {
      // 打开导航链接
      const url = getNavigationUrl(type)
      window.open(url, '_blank')
    })
  } catch (error) {
    // 没有位置权限，直接打开导航
    const url = getNavigationUrl(type)
    window.open(url, '_blank')
  }
}

// 计算两点距离（米）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 格式化距离
function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}米`
  }
  return `${(distance / 1000).toFixed(1)}公里`
}

// 预估时间
function estimateTime(distance: number): string {
  // 假设平均速度 30km/h
  const hours = distance / 30000
  if (hours < 1) {
    return `${Math.round(hours * 60)}分钟`
  }
  return `${Math.round(hours * 10) / 10}小时`
}

// 生成导航链接
function getNavigationUrl(type: 'amap' | 'bmap' | 'qqmap'): string {
  if (!navigationLinks.value) return ''

  switch (type) {
    case 'amap':
      return navigationLinks.value.amap.web
    case 'bmap':
      return navigationLinks.value.baidu.web
    case 'qqmap':
      return navigationLinks.value.tencent.web
    default:
      return ''
  }
}

onMounted(() => {
  fetchMuseumInfo()
})
</script>

<template>
  <div class="navigation-page">
    <van-nav-bar
      title="导航"
      left-arrow
      @click-left="router.back()"
    />

    <div class="page-content">
      <!-- 地图占位 -->
      <div class="map-container">
        <div class="map-placeholder">
          <van-icon name="location" size="48" color="#1989fa" />
          <p>地图加载中...</p>
          <p class="map-hint">点击下方导航按钮开始导航</p>
        </div>
      </div>

      <!-- 导航卡片 -->
      <NavigationCard
        v-if="museum.id"
        :museum-name="museum.name"
        :address="museum.address"
        :latitude="museum.latitude"
        :longitude="museum.longitude"
        @navigate="handleNavigate"
      />

      <!-- 导航提示 -->
      <div class="navigation-info">
        <div class="info-title">
          <van-icon name="info-o" />
          <span>导航说明</span>
        </div>
        <div class="info-content">
          <p>1. 点击上方地图应用图标即可开始导航</p>
          <p>2. 请确保已安装对应地图应用</p>
          <p>3. 建议使用高德地图或百度地图获得最佳体验</p>
          <p>4. 导航过程中请注意交通安全</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 12px;
}

.map-container {
  height: 200px;
  background-color: #e3f2fd;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1989fa;

  p {
    margin-top: 8px;
    font-size: 14px;
  }

  .map-hint {
    font-size: 12px;
    color: #969799;
  }
}

.navigation-info {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;

  .info-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;

    .van-icon {
      color: #1989fa;
    }
  }

  .info-content {
    p {
      font-size: 12px;
      color: #646566;
      line-height: 1.8;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
