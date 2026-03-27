<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getCurrentUser } from '@/api/auth'
import { getFootprintStats } from '@/api/footprint'
import { useUserStore } from '@/stores/user'
import type { User, UserStats } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const user = ref<User | null>(null)
const stats = ref<UserStats | null>(null)
const loading = ref(true)

// 获取用户信息
async function fetchUserInfo() {
  try {
    const res = await getCurrentUser()
    if (res.code === 0 && res.data) {
      user.value = res.data
      userStore.setUserInfo(res.data)
    }

    const statsRes = await getFootprintStats()
    if (statsRes.code === 0 && statsRes.data) {
      stats.value = statsRes.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 跳转页面
function goTo(path: string) {
  router.push(path)
}

// 退出登录
function handleLogout() {
  userStore.logout()
  user.value = null
  stats.value = null
  showToast('已退出登录')
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })
    fetchUserInfo()
  }
})
</script>

<template>
  <div class="user-page">
    <van-nav-bar title="我的" />

    <!-- 用户信息卡片 -->
    <div class="user-card" v-if="userStore.isLoggedIn && user">
      <div class="user-info">
        <van-image :src="user.avatar" width="80" height="80" round fit="cover" />
        <div class="user-detail">
          <div class="nickname">{{ user.nickname }}</div>
          <div class="level">
            <van-tag type="warning">Lv.{{ user.level }}</van-tag>
            <span class="exp">{{ user.exp }} 经验</span>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-grid" v-if="stats">
        <div class="stat-item" @click="goTo('/user/footprint')">
          <div class="stat-value">{{ stats.checkinCount }}</div>
          <div class="stat-label">打卡</div>
        </div>
        <div class="stat-item" @click="goTo('/user/footprint')">
          <div class="stat-value">{{ stats.provinceCount }}</div>
          <div class="stat-label">省份</div>
        </div>
        <div class="stat-item" @click="goTo('/medal')">
          <div class="stat-value">{{ stats.medalCount }}</div>
          <div class="stat-label">勋章</div>
        </div>
        <div class="stat-item" @click="goTo('/user/favorites')">
          <div class="stat-value">{{ user.medalCount }}</div>
          <div class="stat-label">收藏</div>
        </div>
      </div>
    </div>

    <!-- 未登录状态 -->
    <div class="login-prompt" v-else>
      <van-empty description="登录后查看更多信息">
        <van-button type="primary" round @click="goTo('/login')">立即登录</van-button>
      </van-empty>
    </div>

    <!-- 功能菜单 -->
    <van-cell-group inset class="menu-group">
      <van-cell title="我的足迹" icon="location-o" is-link @click="goTo('/user/footprint')" />
      <van-cell title="我的收藏" icon="star-o" is-link @click="goTo('/user/favorites')" />
      <van-cell title="我的勋章" icon="medal-o" is-link @click="goTo('/medal')" />
      <van-cell title="设置" icon="setting-o" is-link />
    </van-cell-group>

    <!-- 退出登录 -->
    <div class="logout-section" v-if="userStore.isLoggedIn">
      <van-button block round type="danger" plain @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.user-card {
  background: linear-gradient(135deg, #1989fa 0%, #36d1dc 100%);
  padding: 20px;
  color: white;

  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    .user-detail {
      flex: 1;

      .nickname {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .level {
        display: flex;
        align-items: center;
        gap: 8px;

        .exp {
          font-size: 12px;
          opacity: 0.8;
        }
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
      }

      .stat-label {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
}

.login-prompt {
  padding: 40px 20px;
  background: linear-gradient(135deg, #1989fa 0%, #36d1dc 100%);
}

.menu-group {
  margin-top: 12px;
}

.logout-section {
  padding: 20px;
  margin-top: 20px;
}
</style>
