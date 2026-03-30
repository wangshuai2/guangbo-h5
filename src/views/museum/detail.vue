<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
const activeTab = ref('intro')

// 计算开放状态
const openStatus = computed(() => {
  if (!museum.value?.openTime) return { text: '暂无信息', type: 'unknown' }
  
  const now = new Date()
  const hour = now.getHours()
  const [openH, openM] = museum.value.openTime.split(':').map(Number)
  const [closeH, closeM] = museum.value.closeTime?.split(':').map(Number) || [17, 0]
  
  const currentMinutes = hour * 60 + now.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  
  if (currentMinutes < openMinutes) {
    return { text: `${museum.value.openTime} 开馆`, type: 'closed' }
  }
  if (currentMinutes >= closeMinutes) {
    return { text: '已闭馆', type: 'closed' }
  }
  if (closeMinutes - currentMinutes <= 60) {
    return { text: '即将闭馆', type: 'warning' }
  }
  return { text: '营业中', type: 'open' }
})

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
  
  if (!userStore.isLoggedIn) {
    showConfirmDialog({
      title: '提示',
      message: '请先登录后再收藏',
      confirmButtonText: '去登录',
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

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
      confirmButtonText: '去登录',
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  try {
    const position = await getCurrentPosition()

    const res = await checkIn({
      museumId: museum.value!.id,
      latitude: position.lat,
      longitude: position.lng,
    })

    if (res.code === 0 && res.data) {
      showToast({
        type: 'success',
        message: '打卡成功！',
      })

      if (res.data.medals && res.data.medals.length > 0) {
        showToast({
          message: `恭喜获得勋章：${res.data.medals[0].name}`,
          icon: 'medal-o',
        })
      }
    }
  } catch (error: any) {
    showToast(error.message || '打卡失败')
  }
}

// 获取当前位置
function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    resolve({ lat: 39.9163, lng: 116.3972 })
  })
}

// 导航
function handleNavigate() {
  if (!museum.value) return
  router.push(`/museum/${museum.value.id}/navigation`)
}

// 分享
function handleShare() {
  if (!museum.value) return
  
  // 使用 Web Share API 或复制链接
  if (navigator.share) {
    navigator.share({
      title: museum.value.name,
      text: museum.value.description,
      url: window.location.href,
    }).catch(() => {
      // 用户取消分享
    })
  } else {
    // 复制链接
    navigator.clipboard.writeText(window.location.href)
    showToast('链接已复制')
  }
}

// 查看评价
function handleReviews() {
  if (!museum.value) return
  router.push(`/museum/${museum.value.id}/reviews`)
}

// 类型映射
const typeMap: Record<string, string> = {
  history: '历史博物馆',
  art: '艺术博物馆',
  science: '科技博物馆',
  nature: '自然博物馆',
  general: '综合博物馆',
}

// 类型图标
const typeIcon: Record<string, string> = {
  history: 'clock-o',
  art: 'photo-o',
  science: 'cluster-o',
  nature: 'flower-o',
  general: 'apps-o',
}

onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  fetchMuseumDetail()
})
</script>

<template>
  <div class="museum-detail">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="museum?.name || '博物馆详情'"
      left-arrow
      fixed
      placeholder
      @click-left="router.back()"
    >
      <template #right>
        <div class="nav-actions">
          <van-icon
            :name="isFavorited ? 'star' : 'star-o'"
            :color="isFavorited ? '#d4a574' : '#fff'"
            size="22"
            @click="toggleFavorite"
          />
          <van-icon name="share-o" color="#fff" size="22" @click="handleShare" />
        </div>
      </template>
    </van-nav-bar>

    <template v-if="museum">
      <!-- 封面图区域 -->
      <div class="cover-section">
        <van-image
          :src="museum.coverImage"
          width="100%"
          height="280"
          fit="cover"
          class="cover-image"
        />
        <div class="cover-overlay">
          <div class="museum-badge">
            <van-icon :name="typeIcon[museum.type] || 'apps-o'" size="16" />
            <span>{{ typeMap[museum.type] || '博物馆' }}</span>
          </div>
          <div class="open-status" :class="openStatus.type">
            <span class="status-dot"></span>
            <span>{{ openStatus.text }}</span>
          </div>
        </div>
      </div>

      <!-- 信息卡片 -->
      <div class="info-card">
        <h1 class="museum-name">{{ museum.name }}</h1>
        
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-icon rating">
              <van-icon name="star" size="18" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ museum.rating }}</span>
              <span class="stat-label">{{ museum.ratingCount || 0 }} 评价</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon checkin">
              <van-icon name="location-o" size="18" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ museum.checkinCount }}</span>
              <span class="stat-label">打卡</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon favorite">
              <van-icon name="star-o" size="18" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ museum.favoriteCount || 0 }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>
        </div>

        <!-- 地址信息 -->
        <div class="address-info">
          <van-icon name="map-marker" class="address-icon" />
          <span class="address-text">{{ museum.address }}</span>
          <van-button size="small" plain round class="nav-btn" @click="handleNavigate">
            导航
          </van-button>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <div class="action-item" @click="handleCheckIn">
          <div class="action-icon">
            <van-icon name="location-o" size="24" />
          </div>
          <span>打卡</span>
        </div>
        <div class="action-item" @click="toggleFavorite">
          <div class="action-icon">
            <van-icon :name="isFavorited ? 'star' : 'star-o'" size="24" />
          </div>
          <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
        </div>
        <div class="action-item" @click="handleNavigate">
          <div class="action-icon">
            <van-icon name="guide-o" size="24" />
          </div>
          <span>导航</span>
        </div>
        <div class="action-item" @click="handleReviews">
          <div class="action-icon">
            <van-icon name="chat-o" size="24" />
          </div>
          <span>评价</span>
        </div>
      </div>

      <!-- 详情信息 -->
      <div class="detail-tabs">
        <van-tabs v-model:active="activeTab" sticky offset-top="46">
          <van-tab name="intro" title="简介">
            <div class="tab-content">
              <p class="description">{{ museum.description }}</p>
            </div>
          </van-tab>
          
          <van-tab name="info" title="参观信息">
            <div class="tab-content">
              <van-cell-group inset>
                <van-cell title="开放时间">
                  <template #value>
                    {{ museum.openTime || '09:00' }} - {{ museum.closeTime || '17:00' }}
                  </template>
                </van-cell>
                <van-cell title="门票价格" :value="museum.ticketInfo || '免费'" />
                <van-cell title="联系电话" :value="museum.phone || '暂无'" />
                <van-cell v-if="museum.website" title="官方网站" :value="museum.website" is-link />
              </van-cell-group>
            </div>
          </van-tab>
          
          <van-tab name="treasures" title="镇馆之宝" v-if="museum.treasures?.length">
            <div class="tab-content">
              <div class="treasure-grid">
                <div v-for="treasure in museum.treasures" :key="treasure.id" class="treasure-card">
                  <van-image
                    :src="treasure.image"
                    width="100%"
                    height="140"
                    fit="cover"
                    radius="12"
                    class="treasure-image"
                  />
                  <div class="treasure-info">
                    <div class="treasure-name">{{ treasure.name }}</div>
                    <div class="treasure-desc">{{ treasure.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-bar">
        <van-button type="primary" block round size="large" class="checkin-btn" @click="handleCheckIn">
          <van-icon name="location-o" class="btn-icon" />
          <span>立即打卡</span>
        </van-button>
      </div>
    </template>

    <van-empty v-else-if="!loading" description="博物馆不存在" />
  </div>
</template>

<style lang="scss" scoped>
.museum-detail {
  min-height: 100vh;
  background-color: #f5f5f7;
  padding-bottom: 80px;
}

// 导航栏操作
.nav-actions {
  display: flex;
  gap: 16px;
}

// 封面区域
.cover-section {
  position: relative;

  .cover-image {
    display: block;
  }

  .cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 280px;
    background: linear-gradient(180deg, 
      rgba(0,0,0,0.3) 0%, 
      rgba(0,0,0,0.1) 50%,
      rgba(0,0,0,0.4) 100%
    );
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px 16px;

    .museum-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 6px 12px;
      border-radius: 16px;
      color: #fff;
      font-size: 12px;
      width: fit-content;
    }

    .open-status {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.9);
      padding: 8px 16px;
      border-radius: 20px;
      width: fit-content;
      font-size: 13px;
      font-weight: 500;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.open {
        color: #07c160;
        .status-dot { background: #07c160; }
      }
      &.warning {
        color: #ff976a;
        .status-dot { background: #ff976a; }
      }
      &.closed {
        color: #969799;
        .status-dot { background: #969799; }
      }
      &.unknown {
        color: #646566;
        .status-dot { background: #646566; }
      }
    }
  }
}

// 信息卡片
.info-card {
  background: #fff;
  margin: -20px 16px 16px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  position: relative;
  z-index: 1;

  .museum-name {
    font-size: 24px;
    font-weight: 600;
    color: #2c2c2e;
    margin-bottom: 16px;
    letter-spacing: 1px;
  }

  .stats-row {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f5f5f7;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .stat-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.rating { background: rgba(255,149,106,0.15); color: #ff976a; }
        &.checkin { background: rgba(25,137,250,0.15); color: #1989fa; }
        &.favorite { background: rgba(212,165,116,0.15); color: #d4a574; }
      }

      .stat-content {
        display: flex;
        flex-direction: column;

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #2c2c2e;
        }

        .stat-label {
          font-size: 12px;
          color: #8e8e93;
        }
      }
    }
  }

  .address-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .address-icon {
      color: #8b5a2b;
      font-size: 18px;
    }

    .address-text {
      flex: 1;
      font-size: 14px;
      color: #646566;
    }

    .nav-btn {
      color: #8b5a2b;
      border-color: #d4a574;
    }
  }
}

// 快捷操作
.quick-actions {
  display: flex;
  justify-content: space-around;
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.95);
    }

    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(139,90,43,0.1), rgba(212,165,116,0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8b5a2b;
    }

    span {
      font-size: 12px;
      color: #646566;
    }
  }
}

// 详情标签页
.detail-tabs {
  margin: 0 16px;

  .tab-content {
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    margin-top: 12px;

    .description {
      font-size: 15px;
      color: #646566;
      line-height: 1.8;
    }
  }

  .treasure-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .treasure-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);

      .treasure-image {
        display: block;
      }

      .treasure-info {
        padding: 12px;

        .treasure-name {
          font-size: 14px;
          font-weight: 600;
          color: #2c2c2e;
          margin-bottom: 4px;
        }

        .treasure-desc {
          font-size: 12px;
          color: #8e8e93;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));

  .checkin-btn {
    background: linear-gradient(135deg, #8b5a2b, #d4a574);
    border: none;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;

    .btn-icon {
      margin-right: 8px;
    }
  }
}
</style>
