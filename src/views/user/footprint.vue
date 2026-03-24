<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getFootprintMap, getFootprintStats } from '@/api/footprint'
import type { FootprintMap, UserStats } from '@/types'

const router = useRouter()

const stats = ref<UserStats | null>(null)
const footprintMap = ref<FootprintMap | null>(null)
const loading = ref(true)

async function fetchFootprint() {
  try {
    const [statsRes, mapRes] = await Promise.all([
      getFootprintStats(),
      getFootprintMap(),
    ])

    if (statsRes.code === 0 && statsRes.data) {
      stats.value = statsRes.data
    }

    if (mapRes.code === 0 && mapRes.data) {
      footprintMap.value = mapRes.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  fetchFootprint()
})
</script>

<template>
  <div class="footprint-page">
    <van-nav-bar title="我的足迹" left-arrow @click-left="router.back()" />

    <!-- 统计概览 -->
    <div class="stats-card" v-if="stats">
      <div class="stat-item">
        <van-icon name="location" size="24" color="#1989fa" />
        <div class="stat-value">{{ stats.checkinCount }}</div>
        <div class="stat-label">打卡博物馆</div>
      </div>
      <div class="stat-item">
        <van-icon name="map-peasons" size="24" color="#07c160" />
        <div class="stat-value">{{ stats.provinceCount }}</div>
        <div class="stat-label">解锁省份</div>
      </div>
      <div class="stat-item">
        <van-icon name="city" size="24" color="#ff976a" />
        <div class="stat-value">{{ stats.cityCount }}</div>
        <div class="stat-label">解锁城市</div>
      </div>
    </div>

    <!-- 地图占位 -->
    <div class="map-placeholder">
      <van-icon name="map" size="60" color="#ccc" />
      <p>足迹地图展示区域</p>
    </div>

    <!-- 省份列表 -->
    <div class="province-list" v-if="footprintMap">
      <h3 class="section-title">解锁省份</h3>
      <van-cell-group inset>
        <van-cell
          v-for="province in footprintMap.provinces"
          :key="province.code"
          :title="province.name"
          :value="`${province.checkinCount}家博物馆`"
          is-link
        />
      </van-cell-group>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footprint-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: #fff;
  margin-bottom: 12px;

  .stat-item {
    text-align: center;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #323233;
      margin: 8px 0 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #646566;
    }
  }
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #f0f0f0;
  color: #999;
  margin-bottom: 12px;
}

.province-list {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    padding: 16px;
  }
}
</style>