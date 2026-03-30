<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getExhibitDetail, likeExhibit } from '@/api/exhibits'
import { useUserStore } from '@/stores/user'
import type { Exhibit } from '@/api/exhibits'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const exhibit = ref<Exhibit | null>(null)
const loading = ref(true)
const isLiked = ref(false)
const showActions = ref(false)
const activeImage = ref(0)

// 加载展品详情
async function loadExhibit() {
  const id = Number(route.params.id)
  if (!id) return

  try {
    const res = await getExhibitDetail(id)
    if (res.code === 0 && res.data) {
      exhibit.value = res.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 返回
function goBack() {
  router.back()
}

// 跳转博物馆
function goToMuseum() {
  if (!exhibit.value) return
  router.push(`/museum/${exhibit.value.museumId}`)
}

// 点赞
async function handleLike() {
  if (!exhibit.value) return
  
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    await likeExhibit(exhibit.value.id)
    isLiked.value = !isLiked.value
    exhibit.value.likes += isLiked.value ? 1 : -1
    showToast(isLiked.value ? '已点赞' : '已取消')
  } catch (error) {
    showToast('操作失败')
  }
}

// 预览图片
function previewImage(index: number) {
  if (!exhibit.value?.images?.length) return
  
  import('vant').then(({ showImagePreview }) => {
    showImagePreview({
      images: exhibit.value!.images || [exhibit.value!.image],
      startPosition: index,
    })
  })
}

// 分享
function handleShare() {
  if (navigator.share && exhibit.value) {
    navigator.share({
      title: exhibit.value.name,
      text: exhibit.value.description,
      url: window.location.href,
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(window.location.href)
    showToast('链接已复制')
  }
}

onMounted(() => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  loadExhibit()
})
</script>

<template>
  <div class="exhibit-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="exhibit?.name || '展品详情'"
      left-arrow
      fixed
      placeholder
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="share-o" size="20" @click="handleShare" />
      </template>
    </van-nav-bar>

    <template v-if="exhibit">
      <!-- 图片轮播 -->
      <div class="image-section">
        <van-swipe
          class="image-swipe"
          :autoplay="0"
          indicator-color="white"
          @change="(i: number) => activeImage = i"
        >
          <van-swipe-item>
            <van-image
              :src="exhibit.image"
              width="100%"
              height="300"
              fit="cover"
              @click="previewImage(0)"
            />
          </van-swipe-item>
          <van-swipe-item v-for="(img, i) in exhibit.images" :key="i">
            <van-image
              :src="img"
              width="100%"
              height="300"
              fit="cover"
              @click="previewImage(i + 1)"
            />
          </van-swipe-item>
        </van-swipe>
        <div class="image-indicator" v-if="exhibit.images?.length">
          {{ activeImage + 1 }} / {{ (exhibit.images?.length || 0) + 1 }}
        </div>
        <div class="featured-badge" v-if="exhibit.isFeatured">
          <van-icon name="star" size="12" />
          镇馆之宝
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="info-card">
        <h1 class="exhibit-name">{{ exhibit.name }}</h1>
        
        <div class="exhibit-meta">
          <van-tag type="primary" size="medium">{{ exhibit.category }}</van-tag>
          <van-tag plain size="medium">{{ exhibit.period }}</van-tag>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <van-icon name="eye-o" size="18" />
            <span>{{ exhibit.views }} 浏览</span>
          </div>
          <div class="stat-item">
            <van-icon name="like-o" size="18" />
            <span>{{ exhibit.likes }} 点赞</span>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="detail-section">
        <div class="section-title">展品信息</div>
        <van-cell-group inset>
          <van-cell title="所属博物馆" :value="exhibit.museumName" is-link @click="goToMuseum" />
          <van-cell title="年代" :value="exhibit.period" />
          <van-cell title="分类" :value="exhibit.category" />
          <van-cell title="尺寸" :value="exhibit.size || '暂无'" />
          <van-cell title="材质" :value="exhibit.material || '暂无'" />
        </van-cell-group>
      </div>

      <!-- 展品介绍 -->
      <div class="detail-section">
        <div class="section-title">展品介绍</div>
        <div class="description-content">
          {{ exhibit.description }}
        </div>
      </div>

      <!-- 音频讲解 -->
      <div class="detail-section" v-if="exhibit.audio">
        <div class="section-title">语音讲解</div>
        <audio :src="exhibit.audio" controls class="audio-player" />
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-bar">
        <div class="action-item" @click="handleLike">
          <van-icon :name="isLiked ? 'like' : 'like-o'" :color="isLiked ? '#ff3b30' : '#646566'" size="22" />
          <span>点赞</span>
        </div>
        <div class="action-item" @click="goToMuseum">
          <van-icon name="home-o" size="22" />
          <span>博物馆</span>
        </div>
        <div class="action-item" @click="handleShare">
          <van-icon name="share-o" size="22" />
          <span>分享</span>
        </div>
      </div>
    </template>

    <van-empty v-else-if="!loading" description="展品不存在" />
  </div>
</template>

<style lang="scss" scoped>
.exhibit-detail-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  padding-bottom: 70px;
}

.image-section {
  position: relative;

  .image-swipe {
    height: 300px;
  }

  .image-indicator {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
  }

  .featured-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: linear-gradient(135deg, #c9a227, #f4d03f);
    color: #5a4a1f;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.info-card {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;

  .exhibit-name {
    font-size: 20px;
    font-weight: 600;
    color: #2c2c2e;
    margin-bottom: 12px;
  }

  .exhibit-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .stats-row {
    display: flex;
    gap: 24px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #8e8e93;
    }
  }
}

.detail-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c2c2e;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid #8b5a2b;
  }

  .description-content {
    font-size: 14px;
    color: #646566;
    line-height: 1.8;
  }
}

.audio-player {
  width: 100%;
  border-radius: 8px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    span {
      font-size: 12px;
      color: #646566;
    }
  }
}
</style>
