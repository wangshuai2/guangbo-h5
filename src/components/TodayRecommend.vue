<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getTodayRecommend, getNearbyRecommend } from '@/api/recommend'
import type { Museum } from '@/types'

const router = useRouter()

// 状态
const loading = ref(false)
const seasonMuseums = ref<Museum[]>([])
const nearbyMuseums = ref<Museum[]>([])
const hasLocation = ref(false)
const locationDenied = ref(false)

// 计算是否有推荐内容
const hasRecommend = computed(() => {
  return seasonMuseums.value.length > 0 || nearbyMuseums.value.length > 0
})

// 获取位置并加载附近博物馆
async function requestLocation() {
  if (!navigator.geolocation) {
    locationDenied.value = true
    return
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })

    hasLocation.value = true
    const { latitude, longitude } = position.coords

    // 加载附近博物馆
    const res = await getNearbyRecommend(latitude, longitude, 5000, 5)
    if (res.code === 0 && res.data) {
      nearbyMuseums.value = res.data
    }
  } catch (error) {
    console.log('获取位置失败', error)
    locationDenied.value = true
  }
}

// 加载推荐数据
async function loadRecommend() {
  loading.value = true
  showLoadingToast({
    message: '加载推荐...',
    forbidClick: true,
    duration: 0
  })

  try {
    // 并行加载季节推荐和位置
    const [todayRes] = await Promise.all([
      getTodayRecommend(5),
      requestLocation()
    ])

    if (todayRes.code === 0 && todayRes.data) {
      seasonMuseums.value = [...(todayRes.data.season || []), ...(todayRes.data.hot || [])]
        .slice(0, 5) // 取前5个
    }
  } catch (error) {
    showToast('加载推荐失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 跳转博物馆详情
function goToDetail(id: number) {
  router.push(`/museum/${id}`)
}

// 刷新位置
function refreshLocation() {
  locationDenied.value = false
  requestLocation()
}

// 初始化
onMounted(() => {
  loadRecommend()
})
</script>

<template>
  <div class="today-recommend">
    <!-- 标题栏 -->
    <div class="recommend-header">
      <div class="title">
        <van-icon name="fire-o" color="#ee0a24" />
        <span>今日推荐</span>
      </div>
      <van-icon name="replay" @click="loadRecommend" />
    </div>

    <!-- 加载中 -->
    <van-loading v-if="loading" class="loading-placeholder" />

    <!-- 推荐内容 -->
    <div v-else-if="hasRecommend" class="recommend-content">
      <!-- 附近博物馆 -->
      <div v-if="nearbyMuseums.length > 0" class="recommend-section">
        <div class="section-title">
          <van-icon name="location-o" />
          <span>附近推荐</span>
        </div>
        <div class="museum-scroll">
          <div
            v-for="museum in nearbyMuseums"
            :key="museum.id"
            class="museum-card"
            @click="goToDetail(museum.id)"
          >
            <van-image
              :src="museum.coverImage"
              width="140"
              height="100"
              fit="cover"
              radius="8"
              lazy-load
            />
            <div class="museum-info">
              <div class="museum-name">{{ museum.name }}</div>
              <div class="museum-meta">
                <span v-if="museum.distance" class="distance">
                  {{ museum.distance < 1000 ? `${museum.distance}m` : `${(museum.distance / 1000).toFixed(1)}km` }}
                </span>
                <span v-else>{{ museum.city }}</span>
                <span class="rating">
                  <van-icon name="star" color="#ff976a" size="12" />
                  {{ museum.rating?.toFixed(1) || '暂无' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 季节/热门推荐 -->
      <div v-if="seasonMuseums.length > 0" class="recommend-section">
        <div class="section-title">
          <van-icon name="fire-o" color="#ff976a" />
          <span>精选推荐</span>
        </div>
        <div class="museum-scroll">
          <div
            v-for="museum in seasonMuseums"
            :key="museum.id"
            class="museum-card"
            @click="goToDetail(museum.id)"
          >
            <van-image
              :src="museum.coverImage"
              width="140"
              height="100"
              fit="cover"
              radius="8"
              lazy-load
            />
            <div class="museum-info">
              <div class="museum-name">{{ museum.name }}</div>
              <div class="museum-meta">
                <span>{{ museum.city }}</span>
                <span class="rating">
                  <van-icon name="star" color="#ff976a" size="12" />
                  {{ museum.rating?.toFixed(1) || '暂无' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无推荐数据 -->
    <div v-else class="empty-recommend">
      <van-icon name="info-o" size="24" />
      <span>暂无推荐</span>
    </div>

    <!-- 位置授权提示 -->
    <div v-if="locationDenied && !nearbyMuseums.length" class="location-tip" @click="refreshLocation">
      <van-icon name="location-o" />
      <span>开启定位，发现附近博物馆</span>
      <van-icon name="arrow" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.today-recommend {
  background: #fff;
  border-radius: 12px;
  margin: 12px;
  padding: 12px;
}

.recommend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.recommend-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #646566;
    margin-bottom: 10px;
  }
}

.museum-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.museum-card {
  flex-shrink: 0;
  width: 140px;

  .museum-info {
    padding: 8px 0;
  }

  .museum-name {
    font-size: 13px;
    font-weight: 500;
    color: #323233;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
  }

  .museum-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: #969799;

    .distance {
      color: #1989fa;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 2px;
      color: #ff976a;
    }
  }
}

.empty-recommend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: #969799;
  font-size: 14px;
}

.location-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 13px;
  color: #1989fa;
  cursor: pointer;
}
</style>