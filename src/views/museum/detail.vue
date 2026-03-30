<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import { getMuseumDetail, favoriteMuseum, unfavoriteMuseum, submitRating } from '@/api/museum'
import { checkIn } from '@/api/checkin'
import { useUserStore } from '@/stores/user'
import OpenTimeStatus from '@/components/OpenTimeStatus.vue'
import RatingStars from '@/components/RatingStars.vue'
import ReviewItem from '@/components/ReviewItem.vue'
import type { Museum } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const museum = ref<Museum | null>(null)
const loading = ref(true)
const isFavorited = ref(false)
const showRatingPopup = ref(false)
const userRating = ref(0)
const ratingComment = ref('')
const showReviews = ref(false)

// 模拟评论数据
const reviews = ref([
  {
    id: 1,
    userName: '博物馆爱好者',
    avatar: 'https://picsum.photos/100/100?random=1',
    rating: 5,
    content: '非常棒的博物馆，展品丰富，讲解详细！',
    createTime: '2026-03-28',
    likes: 23,
  },
  {
    id: 2,
    userName: '文化探索者',
    avatar: 'https://picsum.photos/100/100?random=2',
    rating: 4,
    content: '值得一看，就是人有点多，建议工作日去。',
    createTime: '2026-03-27',
    likes: 15,
  },
])

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
  
  const { latitude, longitude, name, address } = museum.value
  
  // 使用腾讯地图导航
  const url = `https://apis.map.qq.com/uri/v1/routeplan?type=drive&from=我的位置&fromcoord=CurrentLocation&to=${encodeURIComponent(name)}&tocoord=${latitude},${longitude}&referer=guangbo`
  
  window.location.href = url
}

// 分享
function handleShare() {
  if (!museum.value) return
  
  // 复制链接到剪贴板
  const shareUrl = `${window.location.origin}/museum/${museum.value.id}`
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('链接已复制，快去分享吧！')
    }).catch(() => {
      showToast('分享失败')
    })
  } else {
    showToast('请手动复制链接分享')
  }
}

// 提交评分
async function submitUserRating() {
  if (!museum.value || userRating.value === 0) return
  
  try {
    const res = await submitRating(museum.value.id, userRating.value, ratingComment.value)
    if (res.code === 0) {
      showToast('评分成功！')
      showRatingPopup.value = false
      userRating.value = 0
      ratingComment.value = ''
    }
  } catch (error) {
    showToast('评分失败')
  }
}

// 类型映射
const typeMap: Record<string, string> = {
  history: '历史博物馆',
  art: '艺术博物馆',
  science: '科技博物馆',
  nature: '自然博物馆',
  general: '综合博物馆',
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
    <van-nav-bar
      title="博物馆详情"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <div class="nav-right">
          <van-icon
            name="share-o"
            size="20"
            @click="handleShare"
            style="margin-right: 16px;"
          />
          <van-icon
            :name="isFavorited ? 'star' : 'star-o'"
            :color="isFavorited ? '#ff976a' : '#333'"
            size="20"
            @click="toggleFavorite"
          />
        </div>
      </template>
    </van-nav-bar>

    <template v-if="museum">
      <!-- 封面图 -->
      <van-image
        :src="museum.coverImage"
        width="100%"
        height="240"
        fit="cover"
      />

      <!-- 基本信息 -->
      <div class="info-section">
        <h1 class="museum-name">{{ museum.name }}</h1>

        <div class="stats-row">
          <div class="stat-item" @click="showReviews = true">
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

        <!-- 开放时间状态 -->
        <OpenTimeStatus 
          v-if="museum.openTime" 
          :open-time="museum.openTime"
          :museum-name="museum.name"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <div class="action-item" @click="handleNavigate">
          <div class="action-icon navigate">
            <van-icon name="location-o" size="24" />
          </div>
          <span class="action-text">导航</span>
        </div>
        <div class="action-item" @click="showRatingPopup = true">
          <div class="action-icon rate">
            <van-icon name="star-o" size="24" />
          </div>
          <span class="action-text">评分</span>
        </div>
        <div class="action-item" @click="showReviews = true">
          <div class="action-icon comment">
            <van-icon name="comment-o" size="24" />
          </div>
          <span class="action-text">评论</span>
        </div>
        <div class="action-item" @click="handleShare">
          <div class="action-icon share">
            <van-icon name="share-o" size="24" />
          </div>
          <span class="action-text">分享</span>
        </div>
      </div>

      <!-- 基本信息 -->
      <van-cell-group inset class="info-group">
        <van-cell title="类型" :value="typeMap[museum.type]" />
        <van-cell title="地址" :value="museum.address" />
        <van-cell title="门票" :value="museum.ticketInfo || '暂无信息'" />
        <van-cell title="电话" :value="museum.phone || '暂无'" />
        <van-cell v-if="museum.website" title="官网" :value="museum.website" is-link @click="() => museum?.website && (window.location.href = museum.website)" />
      </van-cell-group>

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

      <!-- 评论列表 -->
      <div v-if="showReviews" class="section">
        <h3 class="section-title">
          游客评价
          <span class="review-count">({{ museum.ratingCount }})</span>
        </h3>
        <div class="review-list">
          <ReviewItem 
            v-for="review in reviews" 
            :key="review.id"
            :review="review"
          />
        </div>
        <van-button block plain round size="small" @click="showRatingPopup = true">
          写评价
        </van-button>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-bar">
        <van-button type="primary" block round @click="handleCheckIn">
          <van-icon name="location-o" />
          立即打卡
        </van-button>
      </div>

      <!-- 评分弹窗 -->
      <van-popup v-model:show="showRatingPopup" position="bottom" round :style="{ height: '50%' }">
        <div class="rating-popup">
          <div class="popup-header">
            <span>评价博物馆</span>
            <van-icon name="cross" @click="showRatingPopup = false" />
          </div>
          <div class="rating-content">
            <div class="rating-stars">
              <RatingStars v-model="userRating" size="large" />
            </div>
            <van-field
              v-model="ratingComment"
              type="textarea"
              placeholder="分享你的参观体验..."
              rows="4"
              maxlength="200"
              show-word-limit
            />
            <van-button 
              type="primary" 
              block 
              round 
              :disabled="userRating === 0"
              @click="submitUserRating"
            >
              提交评价
            </van-button>
          </div>
        </div>
      </van-popup>
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

.nav-right {
  display: flex;
  align-items: center;
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
    cursor: pointer;

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

.action-section {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: #fff;
  margin-bottom: 12px;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.navigate {
        background-color: #e8f5e9;
        color: #07c160;
      }

      &.rate {
        background-color: #fff3e0;
        color: #ff976a;
      }

      &.comment {
        background-color: #e3f2fd;
        color: #1989fa;
      }

      &.share {
        background-color: #f3e5f5;
        color: #9c27b0;
      }
    }

    .action-text {
      font-size: 12px;
      color: #646566;
    }
  }
}

.info-group {
  margin-bottom: 12px;
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

    .review-count {
      font-size: 14px;
      color: #969799;
      font-weight: normal;
    }
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

.review-list {
  margin-bottom: 16px;
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

.rating-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #ebedf0;

    .van-icon {
      font-size: 20px;
      color: #969799;
      cursor: pointer;
    }
  }

  .rating-content {
    flex: 1;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .rating-stars {
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }
  }
}
</style>
