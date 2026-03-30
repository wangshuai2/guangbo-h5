<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getMuseumList } from '@/api/museum'
import type { Museum } from '@/types'

const router = useRouter()

// 搜索状态
const searchValue = ref('')
const searchResults = ref<Museum[]>([])
const loading = ref(false)
const hasSearched = ref(false)

// 搜索历史（本地存储）
const searchHistory = ref<string[]>([])
const maxHistory = 10

// 热门搜索关键词
const hotKeywords = ref([
  '故宫博物院',
  '国家博物馆',
  '秦始皇兵马俑',
  '上海博物馆',
  '南京博物院',
  '陕西历史博物馆',
  '湖南省博物馆',
  '河南博物院',
])

// 分类
const categories = ref([
  { id: 'history', name: '历史', icon: 'clock-o' },
  { id: 'art', name: '艺术', icon: 'photo-o' },
  { id: 'science', name: '科技', icon: 'cluster-o' },
  { id: 'nature', name: '自然', icon: 'flower-o' },
  { id: 'special', name: '专题', icon: 'label-o' },
])
const activeCategory = ref('')

// 加载搜索历史
function loadHistory() {
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    searchHistory.value = JSON.parse(saved)
  }
}

// 保存搜索历史
function saveHistory(keyword: string) {
  const trimmed = keyword.trim()
  if (!trimmed) return

  // 移除重复项
  const index = searchHistory.value.indexOf(trimmed)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }

  // 添加到开头
  searchHistory.value.unshift(trimmed)

  // 限制数量
  if (searchHistory.value.length > maxHistory) {
    searchHistory.value = searchHistory.value.slice(0, maxHistory)
  }

  // 保存到本地存储
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
  showToast('已清空搜索历史')
}

// 点击历史关键词
function onHistoryClick(keyword: string) {
  searchValue.value = keyword
  onSearch()
}

// 点击热门关键词
function onHotClick(keyword: string) {
  searchValue.value = keyword
  onSearch()
}

// 点击分类
function onCategoryClick(categoryId: string) {
  activeCategory.value = activeCategory.value === categoryId ? '' : categoryId
  // 如果有搜索词，重新搜索
  if (searchValue.value.trim()) {
    doSearch()
  }
}

// 执行搜索
async function doSearch() {
  if (!searchValue.value.trim()) return

  loading.value = true
  hasSearched.value = true

  // 保存搜索历史
  saveHistory(searchValue.value)

  try {
    const params: Record<string, unknown> = {
      keyword: searchValue.value,
      pageSize: 50,
    }

    // 添加分类筛选
    if (activeCategory.value) {
      params.type = activeCategory.value
    }

    const res = await getMuseumList(params)
    if (res.code === 0 && res.data) {
      searchResults.value = res.data.list
    }
  } catch (error) {
    console.error(error)
    showToast('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索按钮
function onSearch() {
  doSearch()
}

// 清除搜索内容
function onClear() {
  searchValue.value = ''
  searchResults.value = []
  hasSearched.value = false
  activeCategory.value = ''
}

// 跳转详情
function goToDetail(id: number) {
  router.push(`/museum/${id}`)
}

// 计算是否显示搜索结果
const showResults = computed(() => hasSearched.value)

// 初始化
onMounted(() => {
  loadHistory()
})
</script>

<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <div class="search-header">
      <van-search
        v-model="searchValue"
        placeholder="搜索博物馆"
        show-action
        autofocus
        @search="onSearch"
        @clear="onClear"
      >
        <template #action>
          <van-button size="small" type="primary" @click="onSearch">搜索</van-button>
        </template>
      </van-search>
    </div>

    <!-- 分类筛选 -->
    <div class="category-section" v-if="!showResults">
      <div class="section-title">博物馆分类</div>
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          :class="{ active: activeCategory === cat.id }"
          @click="onCategoryClick(cat.id)"
        >
          <van-icon :name="cat.icon" size="24" />
          <span>{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <!-- 搜索历史 -->
    <div class="history-section" v-if="!showResults && searchHistory.length > 0">
      <div class="section-header">
        <span class="section-title">搜索历史</span>
        <van-icon name="delete-o" @click="clearHistory" />
      </div>
      <div class="tag-list">
        <van-tag
          v-for="(keyword, index) in searchHistory"
          :key="index"
          plain
          size="large"
          @click="onHistoryClick(keyword)"
        >
          {{ keyword }}
        </van-tag>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div class="hot-section" v-if="!showResults">
      <div class="section-title">热门搜索</div>
      <div class="tag-list hot">
        <van-tag
          v-for="(keyword, index) in hotKeywords"
          :key="index"
          :type="index < 3 ? 'danger' : 'default'"
          size="large"
          @click="onHotClick(keyword)"
        >
          <van-icon v-if="index < 3" name="fire-o" />
          {{ keyword }}
        </van-tag>
      </div>
    </div>

    <!-- 分类筛选（搜索结果中） -->
    <div class="category-filter" v-if="showResults">
      <van-tag
        v-for="cat in categories"
        :key="cat.id"
        :type="activeCategory === cat.id ? 'primary' : 'default'"
        size="large"
        @click="onCategoryClick(cat.id)"
      >
        {{ cat.name }}
      </van-tag>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" size="24px" class="loading">搜索中...</van-loading>

    <!-- 搜索结果 -->
    <div class="result-section" v-else-if="showResults">
      <van-empty v-if="searchResults.length === 0" description="没有找到相关博物馆" />

      <div class="result-list" v-else>
        <div class="result-count">找到 {{ searchResults.length }} 个结果</div>
        <div
          v-for="museum in searchResults"
          :key="museum.id"
          class="result-item"
          @click="goToDetail(museum.id)"
        >
          <van-image
            :src="museum.coverImage || 'https://via.placeholder.com/80x60?text=Museum'"
            width="80"
            height="60"
            fit="cover"
            radius="4"
            lazy-load
          />
          <div class="museum-info">
            <div class="museum-name">{{ museum.name }}</div>
            <div class="museum-meta">
              <span class="museum-address">{{ museum.province }} · {{ museum.city }}</span>
              <van-tag v-if="museum.type" size="small" type="primary">
                {{ museum.type === 'history' ? '历史' : museum.type === 'art' ? '艺术' : museum.type === 'science' ? '科技' : '综合' }}
              </van-tag>
            </div>
            <div class="museum-stats" v-if="museum.rating">
              <van-icon name="star" color="#ff976a" />
              <span>{{ museum.rating }}</span>
              <span class="divider">|</span>
              <span>{{ museum.checkinCount || 0 }}人打卡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .section-title {
    margin-bottom: 0;
  }

  .van-icon {
    color: #969799;
    font-size: 18px;
  }
}

// 分类
.category-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 12px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background-color: #f7f8fa;
    border-radius: 8px;
    transition: all 0.2s;

    span {
      font-size: 12px;
      color: #646566;
    }

    &.active {
      background-color: #e8f4ff;

      .van-icon,
      span {
        color: #1989fa;
      }
    }
  }
}

// 历史和热门
.history-section,
.hot-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .van-tag {
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.7;
    }
  }

  &.hot .van-tag {
    .van-icon {
      margin-right: 4px;
    }
  }
}

// 分类筛选（搜索结果）
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff;
  margin-bottom: 1px;
}

// 加载
.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

// 搜索结果
.result-section {
  .result-count {
    padding: 12px 16px;
    font-size: 12px;
    color: #969799;
    background-color: #fff;
  }
}

.result-list {
  .result-item {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    background-color: #fff;
    border-bottom: 1px solid #f7f8fa;

    &:active {
      background-color: #f7f8fa;
    }

    .museum-info {
      flex: 1;
      min-width: 0;

      .museum-name {
        font-size: 15px;
        font-weight: 500;
        color: #323233;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .museum-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .museum-address {
          font-size: 12px;
          color: #646566;
        }
      }

      .museum-stats {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #969799;

        .van-icon {
          font-size: 14px;
        }

        .divider {
          margin: 0 4px;
        }
      }
    }
  }
}
</style>
