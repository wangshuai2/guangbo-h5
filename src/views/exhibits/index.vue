<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getExhibitList, getExhibitCategories } from '@/api/exhibits'
import type { Exhibit } from '@/api/exhibits'

const router = useRouter()
const route = useRoute()

const exhibits = ref<Exhibit[]>([])
const categories = ref<string[]>([])
const activeCategory = ref('')
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 20

// 博物馆ID（从路由参数获取）
const museumId = computed(() => Number(route.query.museumId) || undefined)

// 加载分类
async function loadCategories() {
  try {
    const res = await getExhibitCategories()
    if (res.code === 0 && res.data) {
      categories.value = res.data.categories || []
    }
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

// 加载展品列表
async function loadExhibits(isRefresh = false) {
  if (loading.value) return

  loading.value = true

  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const res = await getExhibitList({
      museumId: museumId.value,
      category: activeCategory.value || undefined,
      page: page.value,
      pageSize,
    })

    if (res.code === 0 && res.data) {
      if (isRefresh) {
        exhibits.value = res.data.list
      } else {
        exhibits.value.push(...res.data.list)
      }

      finished.value = !res.data.pagination.hasMore
      page.value++
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 切换分类
function onCategoryChange(cat: string) {
  activeCategory.value = activeCategory.value === cat ? '' : cat
  exhibits.value = []
  page.value = 1
  finished.value = false
  loadExhibits(true)
}

// 跳转详情
function goToDetail(id: number) {
  router.push(`/exhibits/${id}`)
}

onMounted(() => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  loadCategories()
  loadExhibits()
})
</script>

<template>
  <div class="exhibits-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="展品浏览"
      left-arrow
      @click-left="router.back()"
    />

    <!-- 分类筛选 -->
    <div class="category-filter" v-if="categories.length">
      <van-tag
        v-for="cat in categories"
        :key="cat"
        :type="activeCategory === cat ? 'primary' : 'default'"
        size="large"
        round
        @click="onCategoryChange(cat)"
      >
        {{ cat }}
      </van-tag>
    </div>

    <!-- 展品列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadExhibits"
    >
      <div class="exhibit-list">
        <div
          v-for="exhibit in exhibits"
          :key="exhibit.id"
          class="exhibit-card"
          @click="goToDetail(exhibit.id)"
        >
          <van-image
            :src="exhibit.image"
            width="100%"
            height="180"
            fit="cover"
            radius="12"
            lazy-load
          />
          <div class="exhibit-info">
            <div class="exhibit-name">{{ exhibit.name }}</div>
            <div class="exhibit-meta">
              <van-tag type="primary" size="small">{{ exhibit.category }}</van-tag>
              <span class="period">{{ exhibit.period }}</span>
            </div>
            <div class="exhibit-stats">
              <span><van-icon name="eye-o" /> {{ exhibit.views }}</span>
              <span><van-icon name="like-o" /> {{ exhibit.likes }}</span>
            </div>
          </div>
          <div class="featured-tag" v-if="exhibit.isFeatured">
            <van-icon name="star" />
          </div>
        </div>
      </div>

      <van-empty v-if="!loading && exhibits.length === 0" description="暂无展品" />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.exhibits-page {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #fff;

  .van-tag {
    cursor: pointer;
  }
}

.exhibit-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}

.exhibit-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;

  .exhibit-info {
    padding: 12px;

    .exhibit-name {
      font-size: 14px;
      font-weight: 600;
      color: #2c2c2e;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .exhibit-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .period {
        font-size: 12px;
        color: #8e8e93;
      }
    }

    .exhibit-stats {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #8e8e93;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .featured-tag {
    position: absolute;
    top: 8px;
    right: 8px;
    background: linear-gradient(135deg, #c9a227, #f4d03f);
    color: #5a4a1f;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
