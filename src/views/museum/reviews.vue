<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import ReviewItem from '@/components/ReviewItem.vue'
import ReviewForm from '@/components/ReviewForm.vue'
import RatingStars from '@/components/RatingStars.vue'
import type { Review } from '@/types'

const route = useRoute()
const router = useRouter()

const museumId = computed(() => Number(route.params.id))
const museumName = ref('')

const reviews = ref<Review[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const total = ref(0)

const averageRating = ref(0)
const ratingDistribution = ref<Record<number, number>>({
  5: 0,
  4: 0,
  3: 0,
  2: 0,
  1: 0
})

const showForm = ref(false)

// Mock 数据
const mockReviews: Review[] = [
  {
    id: 1,
    userId: 1,
    userNickname: '博物馆爱好者',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    museumId: 1,
    score: 5,
    content: '非常棒的博物馆！展品丰富，讲解详细，值得一来。特别是镇馆之宝，真的太震撼了！',
    images: [],
    likes: 12,
    isLiked: false,
    createdAt: '2026-03-20T10:30:00Z'
  },
  {
    id: 2,
    userId: 2,
    userNickname: '文化旅行者',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    museumId: 1,
    score: 4,
    content: '整体体验不错，但是周末人有点多，建议工作日去。展览布置很用心，值得一看。',
    images: [],
    likes: 8,
    isLiked: true,
    createdAt: '2026-03-18T14:20:00Z'
  },
  {
    id: 3,
    userId: 3,
    userNickname: '历史迷',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    museumId: 1,
    score: 5,
    content: '作为历史爱好者，这里简直是天堂！每个展品都有详细的介绍，学到了很多东西。',
    images: [],
    likes: 15,
    isLiked: false,
    createdAt: '2026-03-15T09:00:00Z'
  }
]

// 获取评论列表
async function fetchReviews() {
  if (loading.value) return

  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // TODO: 替换为真实 API
    // const res = await getMuseumReviews(museumId.value, { page: page.value, pageSize })
    // if (res.code === 0 && res.data) {
    //   reviews.value = [...reviews.value, ...res.data.list]
    //   total.value = res.data.pagination.total
    //   hasMore.value = res.data.pagination.hasMore
    // }

    // 使用 Mock 数据
    await new Promise(resolve => setTimeout(resolve, 500))
    reviews.value = mockReviews
    total.value = mockReviews.length
    hasMore.value = false

    // 计算评分统计
    calculateRatingStats()
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 计算评分统计
function calculateRatingStats() {
  if (reviews.value.length === 0) return

  const total = reviews.value.length
  const sum = reviews.value.reduce((acc: number, review: Review) => acc + review.score, 0)
  averageRating.value = Math.round((sum / total) * 10) / 10

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach((review: Review) => {
    distribution[review.score]++
  })
  ratingDistribution.value = distribution
}

// 加载更多
function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchReviews()
}

// 点赞评论
async function handleLike(reviewId: number) {
  try {
    // TODO: 替换为真实 API
    // await likeReview(reviewId)

    const review = reviews.value.find((r: Review) => r.id === reviewId)
    if (review) {
      review.isLiked = !review.isLiked
      review.likes += review.isLiked ? 1 : -1
    }
  } catch (error) {
    showToast('操作失败')
  }
}

// 提交评论
async function handleSubmitReview(data: { score: number; content: string; images: string[] }) {
  try {
    // TODO: 替换为真实 API
    // await createReview(museumId.value, data)

    const newReview: Review = {
      id: Date.now(),
      userId: 0,
      userNickname: '我',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
      museumId: museumId.value,
      score: data.score,
      content: data.content,
      images: data.images,
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString()
    }

    reviews.value.unshift(newReview)
    total.value++
    showForm.value = false
    showToast('评价提交成功')

    // 重新计算评分
    calculateRatingStats()
  } catch (error) {
    showToast('提交失败')
  }
}

// 查看评论详情
function handleReviewClick(review: Review) {
  // TODO: 跳转到评论详情页
  console.log('Review clicked:', review)
}

onMounted(() => {
  museumName.value = route.query.name as string || '博物馆'
  fetchReviews()
})
</script>

<template>
  <div class="reviews-page">
    <van-nav-bar
      :title="`${museumName}的评价`"
      left-arrow
      @click-left="router.back()"
    />

    <!-- 评分统计 -->
    <div class="rating-stats">
      <div class="rating-summary">
        <div class="average-score">
          <span class="score">{{ averageRating.toFixed(1) }}</span>
          <span class="total">{{ total }} 条评价</span>
        </div>
        <RatingStars :model-value="Math.round(averageRating)" readonly size="medium" />
      </div>

      <div class="rating-bars">
        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="rating-bar">
          <span class="star-label">{{ star }} 星</span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${total > 0 ? ((ratingDistribution[star] || 0) / total) * 100 : 0}%` }"
            ></div>
          </div>
          <span class="count">{{ ratingDistribution[star] || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 写评价按钮 -->
    <div class="write-review-btn">
      <van-button block round type="primary" @click="showForm = true">
        <van-icon name="edit" />
        写评价
      </van-button>
    </div>

    <!-- 评价列表 -->
    <div class="reviews-list">
      <ReviewItem
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        @like="handleLike"
        @click="handleReviewClick"
      />

      <van-empty v-if="reviews.length === 0 && !loading" description="暂无评价" />

      <van-loading v-if="loading" class="loading-more">加载中...</van-loading>

      <div v-if="!hasMore && reviews.length > 0" class="no-more">没有更多了</div>
    </div>

    <!-- 评价表单弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round style="height: 80vh">
      <ReviewForm
        :museum-id="museumId"
        :museum-name="museumName"
        @submit="handleSubmitReview"
        @cancel="showForm = false"
      />
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.reviews-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.rating-stats {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 12px;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

  .average-score {
    .score {
      font-size: 48px;
      font-weight: 600;
      color: #ff976a;
    }

    .total {
      font-size: 14px;
      color: #969799;
      margin-left: 8px;
    }
  }
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;

  .star-label {
    font-size: 12px;
    color: #646566;
    min-width: 36px;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background-color: #ebedf0;
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: #ff976a;
      border-radius: 4px;
      transition: width 0.3s;
    }
  }

  .count {
    font-size: 12px;
    color: #969799;
    min-width: 24px;
    text-align: right;
  }
}

.write-review-btn {
  padding: 12px 16px;
  background-color: #fff;
  margin-bottom: 12px;
}

.reviews-list {
  padding: 0 12px;
}

.loading-more {
  padding: 20px;
  text-align: center;
}

.no-more {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #969799;
}
</style>
