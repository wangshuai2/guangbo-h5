<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getMuseumNearby } from '@/api/museum'
import { checkIn } from '@/api/checkin'
import { useUserStore } from '@/stores/user'
import type { Museum } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const nearbyMuseums = ref<Museum[]>([])
const loading = ref(true)
const checking = ref(false)
const currentLocation = ref<{ lat: number; lng: number } | null>(null)

async function fetchNearbyMuseums() {
  try {
    currentLocation.value = await getCurrentPosition()

    const res = await getMuseumNearby({
      lat: currentLocation.value.lat,
      lng: currentLocation.value.lng,
      distance: 5000,
    })

    if (res.code === 0 && res.data) {
      nearbyMuseums.value = res.data.list
    }
  } catch (error) {
    showToast('获取附近博物馆失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ lat: 39.9163, lng: 116.3972 })
    }, 500)
  })
}

async function handleCheckIn(museum: Museum) {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  checking.value = true

  try {
    const res = await checkIn({
      museumId: museum.id,
      latitude: currentLocation.value?.lat || 0,
      longitude: currentLocation.value?.lng || 0,
    })

    if (res.code === 0 && res.data) {
      showToast({
        type: 'success',
        message: `在 ${museum.name} 打卡成功！`,
      })
      museum.isCheckin = true
    }
  } catch (error: any) {
    showToast(error.message || '打卡失败')
  } finally {
    checking.value = false
  }
}

function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance}米`
  }
  return `${(distance / 1000).toFixed(1)}公里`
}

onMounted(() => {
  showLoadingToast({
    message: '获取位置中...',
    forbidClick: true,
    duration: 0,
  })
  fetchNearbyMuseums()
})
</script>

<template>
  <div class="checkin-page">
    <van-nav-bar title="打卡" />

    <div class="map-placeholder">
      <van-icon name="location" size="60" color="#1989fa" />
      <p>地图展示区域</p>
      <p class="location-info" v-if="currentLocation">
        当前位置：{{ currentLocation.lat.toFixed(4) }}, {{ currentLocation.lng.toFixed(4) }}
      </p>
    </div>

    <div class="nearby-section">
      <h3 class="section-title">附近博物馆</h3>

      <van-loading v-if="loading" size="24px">加载中...</van-loading>

      <van-empty v-else-if="nearbyMuseums.length === 0" description="附近没有博物馆" />

      <div v-else class="museum-list">
        <div v-for="museum in nearbyMuseums" :key="museum.id" class="museum-item">
          <div class="museum-info">
            <van-image :src="museum.coverImage" width="60" height="60" fit="cover" radius="8" />
            <div class="info-content">
              <div class="museum-name">{{ museum.name }}</div>
              <div class="museum-address">{{ museum.address }}</div>
              <div class="museum-distance">
                <van-icon name="location-o" />
                {{ formatDistance(museum.distance || 0) }}
              </div>
            </div>
          </div>
          <van-button
            :type="museum.isCheckin ? 'default' : 'primary'"
            size="small"
            :loading="checking"
            :disabled="museum.isCheckin"
            @click="handleCheckIn(museum)"
          >
            {{ museum.isCheckin ? '已打卡' : '打卡' }}
          </van-button>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <van-notice-bar left-icon="info-o" background="#ecf9ff" color="#1989fa">
        需要在博物馆附近 500 米范围内才能打卡
      </van-notice-bar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkin-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: linear-gradient(135deg, #e8f4fd 0%, #d1e9fc 100%);
  color: #646566;

  .location-info {
    font-size: 12px;
    margin-top: 8px;
  }
}

.nearby-section {
  padding: 16px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;
  }
}

.museum-list {
  .museum-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 12px;

    .museum-info {
      display: flex;
      gap: 12px;
      flex: 1;

      .info-content {
        flex: 1;

        .museum-name {
          font-size: 16px;
          font-weight: 600;
          color: #323233;
          margin-bottom: 4px;
        }

        .museum-address {
          font-size: 12px;
          color: #646566;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .museum-distance {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #1989fa;
        }
      }
    }
  }
}

.tips-section {
  padding: 0 16px;
}
</style>