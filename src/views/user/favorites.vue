<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getMuseumList } from '@/api/museum'
import type { Museum } from '@/types'

const router = useRouter()

const favorites = ref<Museum[]>([])
const loading = ref(true)

async function fetchFavorites() {
  try {
    // 简化处理，实际应该调用收藏列表接口
    const res = await getMuseumList({ pageSize: 10 })
    if (res.code === 0 && res.data) {
      favorites.value = res.data.list.filter((m: Museum) => m.isFavorited)
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

function goToDetail(id: number) {
  router.push(`/museum/${id}`)
}

onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  fetchFavorites()
})
</script>

<template>
  <div class="favorites-page">
    <van-nav-bar title="我的收藏" left-arrow @click-left="router.back()" />

    <van-empty v-if="!loading && favorites.length === 0" description="还没有收藏任何博物馆" />

    <div class="favorite-list">
      <div
        v-for="museum in favorites"
        :key="museum.id"
        class="museum-item"
        @click="goToDetail(museum.id)"
      >
        <van-image :src="museum.coverImage" width="100" height="80" fit="cover" radius="8" />
        <div class="museum-info">
          <div class="museum-name">{{ museum.name }}</div>
          <div class="museum-address">{{ museum.province }} · {{ museum.city }}</div>
          <div class="museum-rating">
            <van-icon name="star" color="#ff976a" />
            {{ museum.rating }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.favorite-list {
  padding: 12px;

  .museum-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 12px;

    .museum-info {
      flex: 1;

      .museum-name {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }

      .museum-address {
        font-size: 12px;
        color: #646566;
        margin-bottom: 8px;
      }

      .museum-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: #ff976a;
      }
    }
  }
}
</style>