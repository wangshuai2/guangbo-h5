<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

// 计算等级进度
const levelProgress = computed(() => {
  if (!user.value) return 0
  const currentLevelExp = (user.value.level - 1) * 100
  const nextLevelExp = user.value.level * 100
  const progress = ((user.value.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  return Math.min(100, Math.max(0, progress))
})

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
      duration: 0,
    })
    fetchUserInfo()
  }
})
</script>

<template>
  <div class="user-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-pattern"></div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card" v-if="userStore.isLoggedIn && user">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-ring">
          <van-image :src="user.avatar" width="72" height="72" round fit="cover" class="avatar" />
          <div class="level-badge">Lv.{{ user.level }}</div>
        </div>
        <div class="user-name">{{ user.nickname }}</div>
        <div class="user-title">博物馆探索者</div>
        
        <!-- 经验进度条 -->
        <div class="exp-progress">
          <div class="exp-bar">
            <div class="exp-fill" :style="{ width: levelProgress + '%' }"></div>
          </div>
          <div class="exp-text">{{ user.exp }} / {{ user.level * 100 }} 经验</div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-section" v-if="stats">
        <div class="stats-card">
          <div class="stat-item" @click="goTo('/user/footprint')">
            <div class="stat-icon">
              <van-icon name="location-o" size="20" />
            </div>
            <div class="stat-value">{{ stats.checkinCount }}</div>
            <div class="stat-label">打卡记录</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="goTo('/medal')">
            <div class="stat-icon">
              <van-icon name="medal-o" size="20" />
            </div>
            <div class="stat-value">{{ stats.medalCount }}</div>
            <div class="stat-label">获得勋章</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="goTo('/user/favorites')">
            <div class="stat-icon">
              <van-icon name="star-o" size="20" />
            </div>
            <div class="stat-value">{{ user.medalCount || 0 }}</div>
            <div class="stat-label">我的收藏</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-icon">
              <van-icon name="guide-o" size="20" />
            </div>
            <div class="stat-value">{{ stats.provinceCount }}</div>
            <div class="stat-label">探索省份</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 未登录状态 -->
    <div class="login-prompt" v-else>
      <div class="login-card">
        <div class="login-icon">
          <van-icon name="user-o" size="48" />
        </div>
        <div class="login-title">开启博物馆探索之旅</div>
        <div class="login-desc">登录后记录足迹、收集勋章</div>
        <van-button type="primary" round block class="login-btn" @click="goTo('/login')">
          立即登录
        </van-button>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section" v-if="userStore.isLoggedIn">
      <div class="menu-group">
        <div class="menu-title">我的探索</div>
        <div class="menu-list">
          <div class="menu-item" @click="goTo('/user/footprint')">
            <van-icon name="footprint-o" class="menu-icon" />
            <span class="menu-text">我的足迹</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goTo('/user/favorites')">
            <van-icon name="star-o" class="menu-icon" />
            <span class="menu-text">我的收藏</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goTo('/medal')">
            <van-icon name="medal-o" class="menu-icon" />
            <span class="menu-text">勋章墙</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goTo('/user/signin')">
            <van-icon name="calendar-o" class="menu-icon" />
            <span class="menu-text">每日签到</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-title">更多功能</div>
        <div class="menu-list">
          <div class="menu-item">
            <van-icon name="setting-o" class="menu-icon" />
            <span class="menu-text">设置</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item">
            <van-icon name="question-o" class="menu-icon" />
            <span class="menu-text">帮助与反馈</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="logout-btn" @click="handleLogout">
        <van-icon name="revoke" class="logout-icon" />
        <span>退出登录</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  position: relative;
  overflow: hidden;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  overflow: hidden;
  z-index: 0;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
  }

  .bg-circle-1 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #8b5a2b, #d4a574);
    top: -50px;
    right: -30px;
  }

  .bg-circle-2 {
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, #2c5530, #4a7c59);
    top: 80px;
    left: -40px;
  }

  .bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, 
      rgba(139, 90, 43, 0.08) 0%, 
      rgba(212, 165, 116, 0.05) 50%,
      transparent 100%
    );
  }
}

// 用户卡片
.user-card {
  position: relative;
  z-index: 1;
  padding: 24px 16px;
}

// 头像区域
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .avatar-ring {
    position: relative;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d4a574, #8b5a2b);
    padding: 8px;
    box-shadow: 0 4px 20px rgba(139, 90, 43, 0.3);

    .avatar {
      border: 3px solid #fff;
    }

    .level-badge {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #c9a227, #f4d03f);
      color: #5a4a1f;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(201, 162, 39, 0.4);
    }
  }

  .user-name {
    font-size: 22px;
    font-weight: 600;
    color: #2c2c2e;
    margin-top: 16px;
    letter-spacing: 1px;
  }

  .user-title {
    font-size: 13px;
    color: #8e8e93;
    margin-top: 4px;
  }

  .exp-progress {
    width: 200px;
    margin-top: 12px;

    .exp-bar {
      height: 6px;
      background: #e5e5ea;
      border-radius: 3px;
      overflow: hidden;

      .exp-fill {
        height: 100%;
        background: linear-gradient(90deg, #8b5a2b, #d4a574);
        border-radius: 3px;
        transition: width 0.5s ease;
      }
    }

    .exp-text {
      font-size: 11px;
      color: #8e8e93;
      text-align: center;
      margin-top: 4px;
    }
  }
}

// 统计数据
.stats-section {
  margin-top: 20px;

  .stats-card {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: #fff;
    border-radius: 16px;
    padding: 16px 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }

      .stat-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, rgba(139, 90, 43, 0.1), rgba(212, 165, 116, 0.1));
        display: flex;
        align-items: center;
        justify-content: center;
        color: #8b5a2b;
      }

      .stat-value {
        font-size: 22px;
        font-weight: 600;
        color: #2c2c2e;
        margin-top: 8px;
      }

      .stat-label {
        font-size: 12px;
        color: #8e8e93;
        margin-top: 2px;
      }
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: #e5e5ea;
    }
  }
}

// 未登录状态
.login-prompt {
  position: relative;
  z-index: 1;
  padding: 40px 16px;

  .login-card {
    background: #fff;
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    .login-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(139, 90, 43, 0.1), rgba(212, 165, 116, 0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: #8b5a2b;
    }

    .login-title {
      font-size: 20px;
      font-weight: 600;
      color: #2c2c2e;
      margin-bottom: 8px;
    }

    .login-desc {
      font-size: 14px;
      color: #8e8e93;
      margin-bottom: 24px;
    }

    .login-btn {
      background: linear-gradient(135deg, #8b5a2b, #d4a574);
      border: none;
      font-weight: 500;
    }
  }
}

// 菜单区域
.menu-section {
  position: relative;
  z-index: 1;
  padding: 0 16px 24px;

  .menu-group {
    margin-bottom: 16px;

    .menu-title {
      font-size: 13px;
      font-weight: 500;
      color: #8e8e93;
      padding: 8px 0;
      margin-left: 4px;
    }

    .menu-list {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);

      .menu-item {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid #f5f5f7;
        cursor: pointer;
        transition: background 0.2s;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background: #f5f5f7;
        }

        .menu-icon {
          font-size: 20px;
          color: #8b5a2b;
          margin-right: 12px;
        }

        .menu-text {
          flex: 1;
          font-size: 16px;
          color: #2c2c2e;
        }

        .menu-arrow {
          font-size: 14px;
          color: #c7c7cc;
        }
      }
    }
  }

  .logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: #fff;
    border-radius: 12px;
    color: #ff3b30;
    font-size: 15px;
    cursor: pointer;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);

    &:active {
      background: #f5f5f7;
    }

    .logout-icon {
      font-size: 18px;
    }
  }
}
</style>
