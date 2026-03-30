<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import { getNoteDetail, deleteNote, likeNote, unlikeNote } from '@/api/notes'
import { useUserStore } from '@/stores/user'
import type { Note } from '@/api/notes'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const note = ref<Note | null>(null)
const loading = ref(true)
const isLiked = ref(false)
const showActions = ref(false)

// 格式化日期
function formatDate(date: string | undefined) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 加载笔记详情
async function loadNote() {
  const id = Number(route.params.id)
  if (!id) return

  try {
    const res = await getNoteDetail(id)
    if (res.code === 0 && res.data) {
      note.value = res.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 点赞
async function handleLike() {
  if (!note.value) return

  if (!userStore.isLoggedIn) {
    showConfirmDialog({
      title: '提示',
      message: '请先登录',
      confirmButtonText: '去登录',
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  try {
    if (isLiked.value) {
      await unlikeNote(note.value.id)
      note.value.likes--
    } else {
      await likeNote(note.value.id)
      note.value.likes++
    }
    isLiked.value = !isLiked.value
  } catch (error) {
    showToast('操作失败')
  }
}

// 编辑笔记
function handleEdit() {
  if (!note.value) return
  router.push(`/notes/${note.value.id}/edit`)
}

// 删除笔记
async function handleDelete() {
  if (!note.value) return

  showConfirmDialog({
    title: '确认删除',
    message: '删除后无法恢复，确定要删除吗？',
  }).then(async () => {
    try {
      await deleteNote(note.value!.id)
      showToast('删除成功')
      router.back()
    } catch (error) {
      showToast('删除失败')
    }
  }).catch(() => {})
}

// 预览图片
function previewImage(index: number) {
  if (!note.value?.images?.length) return
  
  // 使用 Vant 的 ImagePreview
  import('vant').then(({ showImagePreview }) => {
    showImagePreview({
      images: note.value!.images,
      startPosition: index,
    })
  })
}

onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  loadNote()
})
</script>

<template>
  <div class="note-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="笔记详情"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <van-icon name="ellipsis" size="20" @click="showActions = true" />
      </template>
    </van-nav-bar>

    <template v-if="note">
      <!-- 图片轮播 -->
      <div class="image-section" v-if="note.images?.length">
        <van-swipe class="image-swipe" :autoplay="0" indicator-color="white">
          <van-swipe-item v-for="(img, index) in note.images" :key="index">
            <van-image
              :src="img"
              width="100%"
              height="300"
              fit="cover"
              @click="previewImage(index)"
            />
          </van-swipe-item>
        </van-swipe>
        <div class="image-indicator">{{ note.images.length }} 张图片</div>
      </div>

      <!-- 内容区域 -->
      <div class="content-section">
        <h1 class="note-title">{{ note.title }}</h1>
        
        <div class="note-meta">
          <div class="meta-item">
            <van-icon name="calendar-o" size="14" />
            <span>{{ formatDate(note.visitDate) }}</span>
          </div>
          <div class="meta-item" v-if="note.museum?.name">
            <van-icon name="location-o" size="14" />
            <span>{{ note.museum.name }}</span>
          </div>
        </div>

        <div class="note-content">
          {{ note.content }}
        </div>

        <!-- 标签 -->
        <div class="note-tags">
          <van-tag type="primary" v-if="note.isPublic">公开</van-tag>
          <van-tag plain v-else>私密</van-tag>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-bar">
        <div class="action-item" @click="handleLike">
          <van-icon :name="isLiked ? 'like' : 'like-o'" :color="isLiked ? '#ff3b30' : '#646566'" size="22" />
          <span>{{ note.likes || 0 }}</span>
        </div>
        <div class="action-item">
          <van-icon name="chat-o" size="22" />
          <span>{{ note.comments || 0 }}</span>
        </div>
        <div class="action-item" @click="handleEdit">
          <van-icon name="edit" size="22" />
          <span>编辑</span>
        </div>
      </div>
    </template>

    <van-empty v-else-if="!loading" description="笔记不存在" />

    <!-- 操作面板 -->
    <van-action-sheet v-model:show="showActions" :actions="[
      { name: '编辑', callback: handleEdit },
      { name: '删除', color: '#ff3b30', callback: handleDelete },
    ]" cancel-text="取消" />
  </div>
</template>

<style lang="scss" scoped>
.note-detail-page {
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
}

.content-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 20px;

  .note-title {
    font-size: 22px;
    font-weight: 600;
    color: #2c2c2e;
    margin-bottom: 12px;
  }

  .note-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #8e8e93;
    }
  }

  .note-content {
    font-size: 16px;
    color: #3c3c3e;
    line-height: 1.8;
    margin-bottom: 16px;
  }

  .note-tags {
    display: flex;
    gap: 8px;
  }
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
