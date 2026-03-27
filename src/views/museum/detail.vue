<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import { getMuseumDetail, favoriteMuseum, unfavoriteMuseum } from '@/api/museum'
import { checkIn } from '@/api/checkin'
import { useUserStore } from '@/stores/user'
import type { Museum } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const museum = ref<Museum | null>(null)
const loading = ref(true)
const isFavorited = ref(false)

// 获取博物馆详情
async function fetchMuseumDetail() {
  const id = Number(route.params.id)
  if (!id) return

  try {
    const res = await getMuseumDetail(id)
    if (res.code === 0 && res.data) {
      museum.value = res.data
      isFavorited.value = res.data.isFavorited || false
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 收藏/取消收藏
async function toggleFavorite() {
  if (!museum.value) return

  try {
    if (isFavorited.value) {
      await unfavoriteMuseum(museum.value.id)
      showToast('已取消收藏')
    } else {
      await favoriteMuseum(museum.value.id)
      showToast('收藏成功')
    }
    isFavorited.value = !isFavorited.value
  } catch (error) {
    showToast('操作失败')
  }
}

// 打卡
async function handleCheckIn() {
  if (!museum.value) return

  if (!userStore.isLoggedIn) {
    showConfirmDialog({
      title: '提示',
      message: '请先登录后再打卡',
      confirmButtonText: '去登录'
    })
      .then(() => {
        router.push('/login')
      })
      .catch(() => {})
    return
  }

  try {
    const position = await getCurrentPosition()

    const res = await checkIn({
      museumId: museum.value!.id,
      latitude: position.lat,
      longitude: position.lng
    })

    if (res.code === 0 && res.data) {
      showToast({
        type: 'success',
        message: '打卡成功！'
      })

      if (res.data.medals && res.data.medals.length > 0) {
        showToast({
          message: `恭喜获得勋章：${res.data.medals[0].name}`,
          icon: 'medal-o'
        })
      }
    }
  } catch (error: any) {
    showToast(error.message || '打卡失败')
  }
}

// 获取当前位置
function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise(resolve => {
    resolve({ lat: 39.9163, lng: 116.3972 })
  })
}

// 类型映射
const typeMap: Record<string, string> = {
  history: '历史博物馆',
  art: '艺术博物馆',
  science: '科技博物馆',
  nature: '自然博物馆',
  general: '综合博物馆'
}

onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })
  fetchMuseumDetail()
})
</script>

<template>
  <div class="museum-detail">
    <van-nav-bar title="博物馆详情" left-arrow @click-left="router.back()">
      <template #right>
        <van-icon
          :name="isFavorited ? 'star' : 'star-o'"
          :color="isFavorited ? '#ff976a' : '#333'"
          size="20"
          @click="toggleFavorite"
        />
      </template>
    </van-nav-bar>

    <template v-if="museum">
      <!-- 封面图 -->
      <van-image :src="museum.coverImage" width="100%" height="240" fit="cover" />

      <!-- 基本信息 -->
      <div class="info-section">
        <h1 class="museum-name">{{ museum.name }}</h1>

        <div class="stats-row">
          <div class="stat-item">
            <van-icon name="star" color="#ff976a" />
            <span class="value">{{ museum.rating }}</span>
            <span class="label">{{ museum.ratingCount }}条评价</span>
          </div>
          <div class="stat-item">
            <van-icon name="location" color="#1989fa" />
            <span class="value">{{ museum.checkinCount }}</span>
            <span class="label">人打卡</span>
          </div>
        </div>

        <van-cell-group inset>
          <van-cell title="类型" :value="typeMap[museum.type]" />
          <van-cell title="地址" :value="museum.address" />
          <van-cell title="门票" :value="museum.ticketInfo || '暂无信息'" />
          <van-cell title="电话" :value="museum.phone || '暂无'" />
          <van-cell v-if="museum.website" title="官网" :value="museum.website" is-link />
        </van-cell-group>
      </div>

      <!-- 简介 -->
      <div class="section">
        <h3 class="section-title">博物馆简介</h3>
        <p class="description">{{ museum.description }}</p>
      </div>

      <!-- 镇馆之宝 -->
      <div v-if="museum.treasures && museum.treasures.length > 0" class="section">
        <h3 class="section-title">镇馆之宝</h3>
        <div class="treasure-list">
          <div v-for="treasure in museum.treasures" :key="treasure.id" class="treasure-item">
            <van-image :src="treasure.image" width="100%" height="150" fit="cover" radius="8" />
            <div class="treasure-name">{{ treasure.name }}</div>
            <div class="treasure-desc">{{ treasure.description }}</div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-bar">
        <van-button type="primary" block round @click="handleCheckIn">
          <van-icon name="location-o" />
          立即打卡
        </van-button>
      </div>
    </template>

    <van-empty v-else-if="!loading" description="博物馆不存在" />
  </div>
</template>

<style lang="scss" scoped>
.museum-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.info-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 12px;

  .museum-name {
    font-size: 22px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;
  }
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;

    .value {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
    }

    .label {
      font-size: 12px;
      color: #646566;
    }
  }
}

.section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 12px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;
  }

  .description {
    font-size: 14px;
    color: #646566;
    line-height: 1.8;
  }
}

.treasure-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .treasure-item {
    .treasure-name {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin-top: 8px;
    }

    .treasure-desc {
      font-size: 12px;
      color: #646566;
      margin-top: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
</style>
