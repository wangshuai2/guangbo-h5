<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getGuideList, getFeaturedGuides } from '@/api/guides'
import type { Guide } from '@/api/guides'

const router = useRouter()
const guides = ref<Guide[]>([])
const featured = ref<Guide[]>([])
const loading = ref(true)

async function load() {
  try {
    const [listRes, featRes] = await Promise.all([getGuideList(), getFeaturedGuides()])
    if (listRes.code === 0) guides.value = listRes.data?.list || []
    if (featRes.code === 0) featured.value = featRes.data?.list || []
  } catch {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

function goTo(id: number) {
  router.push('/guides/' + id)
}

function fmt(d: string) {
  const n = new Date(d)
  return n.getMonth() + 1 + '月' + n.getDate() + '日'
}

onMounted(() => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  load()
})
</script>

<template>
  <div class="guides-page">
    <van-nav-bar title="参观攻略" />

    <div class="featured" v-if="featured.length">
      <van-swipe :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="g in featured" :key="g.id" @click="goTo(g.id)">
          <van-image :src="g.coverImage" width="100%" height="160" fit="cover" radius="12" />
          <div class="featured-title">{{ g.title }}</div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="list" v-if="!loading">
      <div v-for="g in guides" :key="g.id" class="card" @click="goTo(g.id)">
        <van-image :src="g.coverImage" width="90" height="70" fit="cover" radius="8" />
        <div class="info">
          <div class="title">{{ g.title }}</div>
          <div class="stats">
            <van-icon name="eye-o" /> {{ g.views }}
            <van-icon name="like-o" /> {{ g.likes }}
            <span class="date">{{ fmt(g.createdAt) }}</span>
          </div>
        </div>
      </div>
      <van-empty v-if="!guides.length" />
    </div>
  </div>
</template>

<style scoped>
.guides-page { min-height: 100vh; background: #f5f5f7 }
.featured { padding: 12px; background: #fff }
.featured-title {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 12px;
  background: linear-gradient(transparent, rgba(0,0,0,.6)); color: #fff; font-weight: 500
}
.list { padding: 12px }
.card { display: flex; gap: 12px; padding: 12px; background: #fff; border-radius: 12px; margin-bottom: 12px }
.info { flex: 1; min-width: 0 }
.title {
  font-size: 15px; font-weight: 500; color: #2c2c2e; margin-bottom: 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden
}
.stats { display: flex; gap: 12px; font-size: 12px; color: #8e8e93 }
.date { margin-left: auto }
</style>