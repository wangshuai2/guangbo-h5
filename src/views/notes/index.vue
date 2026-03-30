<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getNoteList } from '@/api/notes'
import { useUserStore } from '@/stores/user'
import type { Note } from '@/api/notes'

const router = useRouter()
const userStore = useUserStore()

const notes = ref<Note[]>([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10
const activeTab = ref<'my' | 'public'>('my')

// 是否登录
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 加载笔记列表
async function loadNotes(isRefresh = false) {
  if (loading.value) return

  loading.value = true

  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  try {
    const params: any = {
      page: page.value,
      pageSize,
    }

    if (activeTab.value === 'my') {
      // 我的笔记
    } else {
      // 公开笔记
      params.isPublic = true
    }

    const res = await getNoteList(params)
    if (res.code === 0 && res.data) {
      if (isRefresh) {
        notes.value = res.data.list
      } else {
        notes.value.push(...res.data.list)
      }

      finished.value = !res.data.hasMore
      page.value++
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    refreshing.value = false
    closeToast()
  }
}

// 下拉刷新
function onRefresh() {
  refreshing.value = true
  loadNotes(true)
}

// 加载更多
function onLoad() {
  loadNotes()
}

// 切换标签
function onTabChange() {
  notes.value = []
  page.value = 1
  finished.value = false
  loadNotes(true)
}

// 跳转详情
function goToDetail(id: number) {
  router.push(`/notes/${id}`)
}

// 创建笔记
function createNote() {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  router.push('/notes/create')
}

// 格式化日期
function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  loadNotes()
})
</script>

<template>
  <div class="notes-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="参观笔记">
      <template #right>
        <van-icon name="plus" size="20" @click="createNote" />
      </template>
    </van-nav-bar>

    <!-- 标签切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab name="my" title="我的笔记" />
      <van-tab name="public" title="公开笔记" />
    </van-tabs>

    <!-- 笔记列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="note-list">
          <div
            v-for="note in notes"
            :key="note.id"
            class="note-card"
            @click="goToDetail(note.id)"
          >
            <!-- 封面图 -->
            <div class="note-cover" v-if="note.images?.length">
              <van-image
                :src="note.images[0]"
                width="100%"
                height="160"
                fit="cover"
                radius="12"
                lazy-load
              />
              <div class="image-count" v-if="note.images.length > 1">
                <van-icon name="photo-o" size="12" />
                <span>{{ note.images.length }}</span>
              </div>
            </div>

            <!-- 内容 -->
            <div class="note-content">
              <div class="note-title">{{ note.title }}</div>
              <div class="note-text">{{ note.content }}</div>
              
              <div class="note-meta">
                <div class="meta-left">
                  <span class="museum-name" v-if="note.museumName">
                    <van-icon name="location-o" size="12" />
                    {{ note.museumName }}
                  </span>
                  <span class="visit-date">{{ formatDate(note.visitDate) }}</span>
                </div>
                <div class="meta-right">
                  <span class="likes">
                    <van-icon name="like-o" size="14" />
                    {{ note.likes }}
                  </span>
                  <span class="comments">
                    <van-icon name="chat-o" size="14" />
                    {{ note.comments }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty
          v-if="!loading && notes.length === 0"
          :description="activeTab === 'my' ? '还没有笔记，去记录你的参观之旅吧' : '暂无公开笔记'"
        >
          <van-button v-if="activeTab === 'my'" type="primary" round @click="createNote">
            写笔记
          </van-button>
        </van-empty>
      </van-list>
    </van-pull-refresh>

    <!-- 浮动按钮 -->
    <div class="fab" @click="createNote">
      <van-icon name="edit" size="24" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notes-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  padding-bottom: 80px;
}

.note-list {
  padding: 12px;
}

.note-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .note-cover {
    position: relative;

    .image-count {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .note-content {
    padding: 16px;

    .note-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c2c2e;
      margin-bottom: 8px;
    }

    .note-text {
      font-size: 14px;
      color: #646566;
      line-height: 1.6;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .note-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .meta-left {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: #8e8e93;

        .museum-name {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .meta-right {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: #8e8e93;

        .likes,
        .comments {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5a2b, #d4a574);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(139, 90, 43, 0.4);
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
}
</style>
