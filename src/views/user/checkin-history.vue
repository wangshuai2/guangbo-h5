<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getCheckinList } from '@/api/checkin'
import { useUserStore } from '@/stores/user'
import type { CheckIn } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const checkinList = ref<CheckIn[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const finished = ref(false)
const page = ref(1)
const total = ref(0)

async function fetchCheckinHistory(isLoadMore = false) {
  if (!isLoadMore) {
    loading.value = true
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0,
    })
  } else {
    loadingMore.value = true
  }

  try {
    const res = await getCheckinList({
      page: page.value,
      pageSize: 20,
    })

    if (res.code === 0 && res.data) {
      if (isLoadMore) {
        checkinList.value.push(...res.data.list)
      } else {
        checkinList.value = res.data.list
      }
      total.value = res.data.pagination.total

      // 判断是否加载完毕
      if (checkinList.value.length >= res.data.pagination.total) {
        finished.value = true
      }
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    loadingMore.value = false
    closeToast()
  }
}

async function onLoad() {
  page.value++
  await fetchCheckinHistory(true)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function goToMuseum(museumId: number) {
  router.push(`/museum/${museumId}`)
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchCheckinHistory()
  } else {
    router.push('/login')
  }
})
</script>

<template>
  <div class="checkin-history-page">
    <van-nav-bar title="打卡记录" left-arrow @click-left="router.back()" />

    <!-- 统计卡片 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="value">{{ total }}</div>
        <div class="label">累计打卡</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="value">{{ new Set(checkinList.map(c => c.museum?.province)).size }}</div>
        <div class="label">省份</div>
      </div>
    </div>

    <!-- 打卡列表 -->
    <van-list
      v-model:loading="loadingMore"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div class="checkin-list">
        <div
          v-for="checkin in checkinList"
          :key="checkin.id"
          class="checkin-item"
          @click="goToMuseum(checkin.museumId)"
        >
          <van-image
            :src="checkin.museum?.coverImage"
            width="80"
            height="80"
            fit="cover"
            radius="8"
          />
          <div class="checkin-info">
            <div class="museum-name">{{ checkin.museum?.name }}</div>
            <div class="location">
              <van-icon name="location-o" />
              {{ checkin.museum?.province }} · {{ checkin.museum?.city }}
            </div>
            <div class="time">
              <van-icon name="clock-o" />
              {{ formatDate(checkin.checkedAt) }} {{ formatTime(checkin.checkedAt) }}
            </div>
          </div>
          <van-icon name="arrow" color="#969799" />
        </div>
      </div>
    </van-list>

    <!-- 空状态 -->
    <van-empty v-if="!loading && checkinList.length === 0" description="暂无打卡记录">
      <van-button type="primary" round @click="router.push('/checkin')">去打卡</van-button>
    </van-empty>
  </div>
</template>

<style lang="scss" scoped>
.checkin-history-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1989fa 0%, #36d1dc 100%);
  color: white;

  .stat-item {
    text-align: center;

    .value {
      font-size: 28px;
      font-weight: 600;
    }

    .label {
      font-size: 12px;
      opacity: 0.8;
    }
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.3);
    margin: 0 30px;
  }
}

.checkin-list {
  padding: 12px;

  .checkin-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    cursor: pointer;

    .checkin-info {
      flex: 1;

      .museum-name {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 8px;
      }

      .location,
      .time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #646566;
        margin-bottom: 4px;
      }
    }
  }
}
</style>