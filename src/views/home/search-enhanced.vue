<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { Museum } from '@/types'

const router = useRouter()

const keyword = ref('')
const loading = ref(false)
const showFilters = ref(false)

// 搜索历史
const searchHistory = ref<string[]>(['故宫', '上海博物馆', '兵马俑'])

// 热门搜索
const hotSearches = ref(['故宫博物院', '三星堆', '国家博物馆', '敦煌'])

// 筛选条件
const filters = ref({
  province: '',
  city: '',
  type: '',
  isFree: false,
  minRating: 0
})

// 博物馆类型
const museumTypes = [
  { value: '', label: '全部' },
  { value: 'history', label: '历史' },
  { value: 'art', label: '艺术' },
  { value: 'science', label: '科技' },
  { value: 'nature', label: '自然' }
]

// 评分选项
const ratingOptions = [
  { value: 0, label: '全部' },
  { value: 4.5, label: '4.5分以上' },
  { value: 4.0, label: '4.0分以上' },
  { value: 3.5, label: '3.5分以上' }
]

// 搜索结果
const searchResults = ref<Museum[]>([])
const hasSearched = ref(false)

// 清除搜索历史
function clearHistory() {
  searchHistory.value = []
}

// 点击历史标签
function clickHistory(tag: string) {
  keyword.value = tag
  handleSearch()
}

// 搜索
async function handleSearch() {
  if (!keyword.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }
  
  loading.value = true
  hasSearched.value = true
  
  try {
    // TODO: 使用真实 API
    // const res = await searchMuseums({
    //   keyword: keyword.value,
    //   ...filters.value
    // })
    // searchResults.value = res.data.list
    
    // Mock 搜索结果
    await new Promise(resolve => setTimeout(resolve, 500))
    searchResults.value = [
      {
        id: 1,
        name: '故宫博物院',
        province: '北京',
        city: '北京',
        rating: 4.9,
        checkinCount: 12580,
        coverImage: 'https://picsum.photos/400/300?random=1',
        isFree: false
      },
      {
        id: 2,
        name: '上海博物馆',
        province: '上海',
        city: '上海',
        rating: 4.7,
        checkinCount: 8932,
        coverImage: 'https://picsum.photos/400/300?random=2',
        isFree: true
      }
    ] as Museum[]
    
    // 添加到搜索历史
    if (!searchHistory.value.includes(keyword.value)) {
      searchHistory.value.unshift(keyword.value)
      if (searchHistory.value.length > 10) {
        searchHistory.value.pop()
      }
    }
  } catch (error) {
    showToast('搜索失败')
  } finally {
    loading.value = false
  }
}

// 应用筛选
function applyFilters() {
  showFilters.value = false
  if (keyword.value) {
    handleSearch()
  }
}

// 重置筛选
function resetFilters() {
  filters.value = {
    province: '',
    city: '',
    type: '',
    isFree: false,
    minRating: 0
  }
}

// 跳转到详情
function goToDetail(id: number) {
  router.push(`/museum/${id}`)
}

// 监听筛选条件变化
watch(filters, () => {
  if (keyword.value && hasSearched.value) {
    handleSearch()
  }
}, { deep: true })
</script>

<template>
  <div class="search-enhanced-page">
    <!-- 搜索栏 -->
    <div class="search-header">
      <van-search
        v-model="keyword"
        placeholder="搜索博物馆名称、城市、类型..."
        show-action
        @search="handleSearch"
      >
        <template #action>
          <div class="search-actions">
            <van-button 
              size="small" 
              type="primary"
              @click="handleSearch"
            >
              搜索
            </van-button>
            <van-button 
              size="small" 
              @click="showFilters = true"
            >
              筛选
            </van-button>
          </div>
        </template>
      </van-search>
    </div>

    <div class="page-content">
      <!-- 搜索历史和热门搜索 -->
      <template v-if="!hasSearched">
        <!-- 搜索历史 -->
        <div v-if="searchHistory.length > 0" class="section">
          <div class="section-header">
            <span class="section-title">搜索历史</span>
            <van-button 
              size="mini" 
              plain 
              @click="clearHistory"
            >
              清除
            </van-button>
          </div>
          <div class="tag-list">
            <van-tag
              v-for="tag in searchHistory"
              :key="tag"
              class="history-tag"
              @click="clickHistory(tag)"
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>

        <!-- 热门搜索 -->
        <div class="section">
          <div class="section-header">
            <span class="section-title">热门搜索</span>
          </div>
          <div class="tag-list">
            <van-tag
              v-for="tag in hotSearches"
              :key="tag"
              type="danger"
              class="hot-tag"
              @click="clickHistory(tag)"
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>
      </template>

      <!-- 搜索结果 -->
      <template v-else>
        <div v-if="loading" class="loading-state">
          <van-loading size="24">搜索中...</van-loading>
        </div>
        
        <div v-else-if="searchResults.length === 0" class="empty-state">
          <van-empty description="暂无搜索结果" />
        </div>
        
        <div v-else class="results-list">
          <div
            v-for="museum in searchResults"
            :key="museum.id"
            class="museum-card"
            @click="goToDetail(museum.id)"
          >
            <van-image
              :src="museum.coverImage"
              width="120"
              height="90"
              fit="cover"
              radius="8"
            />
            <div class="museum-info">
              <div class="museum-name">{{ museum.name }}</div>
              <div class="museum-location">
                <van-icon name="location-o" />
                {{ museum.city }} {{ museum.province }}
              </div>
              <div class="museum-stats">
                <div class="rating">
                  <van-icon name="star" color="#ff976a" />
                  {{ museum.rating }}
                </div>
                <div class="checkin-count">
                  <van-icon name="location" />
                  {{ museum.checkinCount }} 打卡
                </div>
              </div>
              <div v-if="museum.isFree" class="free-badge">免费</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showFilters" position="right" style="width: 80%">
      <div class="filter-panel">
        <div class="filter-header">
          <span class="filter-title">筛选条件</span>
          <van-button size="small" plain @click="resetFilters">
            重置
          </van-button>
        </div>

        <div class="filter-content">
          <!-- 类型筛选 -->
          <div class="filter-section">
            <div class="filter-label">博物馆类型</div>
            <div class="filter-options">
              <van-tag
                v-for="type in museumTypes"
                :key="type.value"
                :type="filters.type === type.value ? 'primary' : 'default'"
                @click="filters.type = type.value"
              >
                {{ type.label }}
              </van-tag>
            </div>
          </div>

          <!-- 评分筛选 -->
          <div class="filter-section">
            <div class="filter-label">最低评分</div>
            <div class="filter-options">
              <van-tag
                v-for="rating in ratingOptions"
                :key="rating.value"
                :type="filters.minRating === rating.value ? 'primary' : 'default'"
                @click="filters.minRating = rating.value"
              >
                {{ rating.label }}
              </van-tag>
            </div>
          </div>

          <!-- 免费筛选 -->
          <div class="filter-section">
            <div class="filter-label">门票</div>
            <van-checkbox v-model="filters.isFree">
              仅显示免费
            </van-checkbox>
          </div>
        </div>

        <div class="filter-footer">
          <van-button block type="primary" @click="applyFilters">
            应用筛选
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.search-enhanced-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-header {
  background-color: #fff;
  padding: 8px 12px;
}

.search-actions {
  display: flex;
  gap: 8px;
}

.page-content {
  padding: 12px;
}

.section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag,
.hot-tag {
  cursor: pointer;
}

.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.museum-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #fff;
  border-radius: 12px;
  cursor: pointer;
}

.museum-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.museum-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.museum-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
}

.museum-stats {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #ff976a;
  font-weight: 500;
}

.checkin-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
}

.free-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #07c160;
  color: white;
  font-size: 10px;
  border-radius: 4px;
  margin-top: 4px;
}

.filter-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
}

.filter-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-footer {
  padding: 16px;
  border-top: 1px solid #ebedf0;
}
</style>
