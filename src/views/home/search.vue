<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMuseumList } from '@/api/museum'
import type { Museum } from '@/types'

const router = useRouter()

const searchValue = ref('')
const searchResults = ref<Museum[]>([])
const loading = ref(false)

async function onSearch() {
  if (!searchValue.value.trim()) return

  loading.value = true
  try {
    const res = await getMuseumList({ keyword: searchValue.value, pageSize: 50 })
    if (res.code === 0 && res.data) {
      searchResults.value = res.data.list
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function goToDetail(id: number) {
  router.push(`/museum/${id}`)
}
</script>

<template>
  <div class="search-page">
    <van-search
      v-model="searchValue"
      placeholder="搜索博物馆"
      show-action
      autofocus
      @search="onSearch"
    >
      <template #action>
        <van-button size="small" type="primary" @click="onSearch">搜索</van-button>
      </template>
    </van-search>

    <van-loading v-if="loading" size="24px" class="loading">搜索中...</van-loading>

    <van-empty v-else-if="searchResults.length === 0 && searchValue" description="没有找到相关博物馆" />

    <div class="result-list" v-else>
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

.loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.result-list {
  padding: 12px;

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
        font-size: 14px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }

      .museum-address {
        font-size: 12px;
        color: #646566;
      }
    }
  }
}
</style>