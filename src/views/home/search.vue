<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getMuseumList } from '@/api/museum'
import type { Museum } from '@/types'

const router = useRouter()

const searchValue = ref('')
const searchResults = ref<Museum[]>([])
const loading = ref(false)
const searchHistory = ref<string[]>([])
const showResults = ref(false)

// 热门搜索
const hotSearches = ref([
  '故宫博物院',
  '国家博物馆',
  '上海博物馆',
  '秦始皇兵马俑',
  '敦煌莫高窟',
  '三星堆',
  '苏州博物馆',
  '南京博物院',
])

// 搜索分类
const searchCategories = [
  { key: 'all', label: '全部' },
  { key: 'museum', label: '博物馆' },
  { key: 'exhibition', label: '展览' },
  { key: 'note', label: '游记' },
]
const activeCategory = ref('all')

// 从本地存储加载搜索历史
function loadSearchHistory() {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
function saveSearchHistory() {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 添加搜索历史
function addSearchHistory(keyword: string) {
  if (!keyword.trim()) return
  
  // 去重并限制数量
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(keyword)
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  saveSearchHistory()
}

// 删除单个搜索历史
function removeSearchHistory(index: number) {
  searchHistory.value.splice(index, 1)
  saveSearchHistory()
}

// 清空搜索历史
function clearSearchHistory() {
  searchHistory.value = []
  saveSearchHistory()
}

// 搜索
async function onSearch() {
  if (!searchValue.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }

  loading.value = true
  showResults.value = true
  
  try {
    const res = await getMuseumList({ keyword: searchValue.value, pageSize: 50 })
    if (res.code === 0 && res.data) {
      searchResults.value = res.data.list
    }
    // 保存搜索历史
    addSearchHistory(searchValue.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 点击历史记录搜索
function searchByHistory(keyword: string) {
  searchValue.value = keyword
  onSearch()
}

// 点击热门搜索
function searchByHot(keyword: string) {
  searchValue.value = keyword
  onSearch()
}

// 返回
function onCancel() {
  if (showResults.value) {
    showResults.value = false
    searchValue.value = ''
    searchResults.value = []
  } else {
    router.back()
  }
}

// 跳转到详情
function goToDetail(id: number) {
  router.push(`/museum/${id}`)
}

onMounted(() => {
  loadSearchHistory()
})
</script>

<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="搜索博物馆、展览、游记"
      show-action
      autofocus
      @search="onSearch"
      @cancel="onCancel"
    >
      <template #action>
        <div @click="onCancel" class="cancel-btn">取消</div>
      </template>
    </van-search>

    <!-- 搜索结果 -->
    <template v-if="showResults">
      <!-- 分类标签 -->
      <div class="category-tabs">
        <div
          v-for="cat in searchCategories"
          :key="cat.key"
          class="category-item"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          {{ cat.label }}
        </div>
      </div>

      <van-loading v-if="loading" size="24px" class="loading">搜索中...</van-loading>

      <van-empty v-else-if="searchResults.length === 0" description="没有找到相关结果" />

      <div class="result-list" v-else>
        <div class="result-count">找到 {{ searchResults.length }} 个结果</div>
        <div
          v-for="museum in searchResults"
          :key="museum.id"
          class="result-item"
          @click="goToDetail(museum.id)"
        >
          <van-image :src="museum.coverImage" width="80" height="60" fit="cover" radius="4" />
          <div class="museum-info">
            <div class="museum-name">{{ museum.name }}</div>
            <div class="museum-address">{{ museum.province }} · {{ museum.city }}</div>
            <div class="museum-tags">
              <van-tag v-if="museum.isFree" type="success" size="small">免费</van-tag>
              <van-tag v-if="museum.rating > 4" type="warning" size="small">{{ museum.rating }}分</van-tag>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 搜索建议页面 -->
    <template v-else>
      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="section">
        <div class="section-header">
          <span class="section-title">搜索历史</span>
          <van-icon name="delete-o" class="clear-icon" @click="clearSearchHistory" />
        </div>
        <div class="history-list">
          <div
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-item"
            @click="searchByHistory(item)"
          >
            <van-icon name="clock-o" class="history-icon" />
            <span class="history-text">{{ item }}</span>
            <van-icon name="cross" class="remove-icon" @click.stop="removeSearchHistory(index)" />
          </div>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">热门搜索</span>
        </div>
        <div class="hot-list">
          <div
            v-for="(item, index) in hotSearches"
            :key="index"
            class="hot-item"
            @click="searchByHot(item)"
          >
            <span class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
            <span class="hot-text">{{ item }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.cancel-btn {
  padding: 0 12px;
  color: #646566;
  font-size: 14px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;

  .category-item {
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 13px;
    color: #646566;
    background-color: #f7f8fa;
    cursor: pointer;

    &.active {
      color: #fff;
      background-color: #1989fa;
    }
  }
}

.loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.result-list {
  padding: 12px;

  .result-count {
    font-size: 13px;
    color: #969799;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  .result-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;
    margin-bottom: 8px;

    .museum-info {
      flex: 1;

      .museum-name {
        font-size: 15px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }

      .museum-address {
        font-size: 12px;
        color: #646566;
        margin-bottom: 8px;
      }

      .museum-tags {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.section {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 12px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #323233;
    }

    .clear-icon {
      font-size: 16px;
      color: #969799;
      cursor: pointer;
    }
  }
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    .history-icon {
      font-size: 16px;
      color: #969799;
    }

    .history-text {
      flex: 1;
      font-size: 14px;
      color: #323233;
    }

    .remove-icon {
      font-size: 14px;
      color: #c8c9cc;
      padding: 4px;
    }
  }
}

.hot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .hot-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #f7f8fa;
    border-radius: 8px;
    cursor: pointer;

    .hot-rank {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      background-color: #969799;
      color: #fff;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;

      &.top {
        background-color: #ff976a;
      }
    }

    .hot-text {
      font-size: 13px;
      color: #323233;
    }
  }
}
</style>
