<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getGuideDetail, likeGuide } from '@/api/guides'
import { useUserStore } from '@/stores/user'
import type { Guide } from '@/api/guides'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const guide = ref<Guide | null>(null)
const loading = ref(true)
const liked = ref(false)

async function load() {
  try {
    const res = await getGuideDetail(Number(route.params.id))
    if (res.code === 0) guide.value = res.data
  } catch {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

async function handleLike() {
  if (!guide.value) return
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    await likeGuide(guide.value.id)
    liked.value = !liked.value
    guide.value.likes += liked.value ? 1 : -1
  } catch {
    showToast('操作失败')
  }
}

function fmt(d: string) {
  const n = new Date(d)
  const m = String(n.getMonth() + 1).padStart(2, '0')
  const day = String(n.getDate()).padStart(2, '0')
  return n.getFullYear() + '-' + m + '-' + day
}

onMounted(() => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  load()
})
</script>

<template>
  <div class="detail-page">
    <van-nav-bar :title="guide?.title || '攻略详情'" left-arrow fixed placeholder @click-left="router.back()">
      <template #right>
        <van-icon
          :name="liked ? 'like' : 'like-o'"
          :color="liked ? '#ff3b30' : '#333'"
          size="20"
          @click="handleLike"
        />
      </template>
    </van-nav-bar>

    <template v-if="guide">
      <van-image :src="guide.coverImage" width="100%" height="200" fit="cover" />

      <div class="info-card">
        <h1>{{ guide.title }}</h1>
        <div class="meta">
          {{ guide.author?.nickname }} · {{ fmt(guide.createdAt) }}
        </div>
        <div class="stats">
          <span><van-icon name="eye-o" /> {{ guide.views }}</span>
          <span><van-icon name="like-o" /> {{ guide.likes }}</span>
        </div>
      </div>

      <div class="content-section">
        <div class="section-title">攻略内容</div>
        <div class="content">{{ guide.content }}</div>
      </div>

      <div class="tags" v-if="guide.tags?.length">
        <van-tag v-for="tag in guide.tags" :key="tag" type="primary" plain>{{ tag }}</van-tag>
      </div>
    </template>

    <van-empty v-else-if="!loading" description="攻略不存在" />
  </div>
</template>

<style scoped>
.detail-page { min-height: 100vh; background: #f5f5f7; padding-bottom: 20px }
.info-card {
  background: #fff; margin: 12px; border-radius: 12px; padding: 16px
}
.info-card h1 { font-size: 20px; font-weight: 600; color: #2c2c2e; margin-bottom: 8px }
.meta { font-size: 13px; color: #8e8e93; margin-bottom: 8px }
.stats { display: flex; gap: 16px; font-size: 13px; color: #8e8e93 }
.content-section {
  background: #fff; margin: 12px; border-radius: 12px; padding: 16px
}
.section-title { font-size: 16px; font-weight: 600; color: #2c2c2e; margin-bottom: 12px }
.content { font-size: 15px; color: #323233; line-height: 1.8; white-space: pre-wrap }
.tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 12px }
</style>