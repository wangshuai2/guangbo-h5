<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { wechatLogin } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)

// 模拟微信登录
async function handleWechatLogin() {
  loading.value = true
  showLoadingToast({
    message: '登录中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    // 模拟获取微信 code
    const mockCode = 'mock_wx_code_' + Date.now()

    const res = await wechatLogin({
      code: mockCode,
      userInfo: {
        nickname: '微信用户',
        avatar: 'https://picsum.photos/100/100',
      },
    })

    if (res.code === 0 && res.data) {
      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data.user)
      showToast({
        type: 'success',
        message: '登录成功',
      })

      // 跳转到之前的页面或首页
      const redirect = route.query.redirect as string
      router.replace(redirect || '/')
    }
  } catch (error) {
    showToast('登录失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 游客模式
function handleGuest() {
  router.replace('/')
}
</script>

<template>
  <div class="login-page">
    <van-nav-bar title="登录" left-arrow @click-left="router.back()" />

    <div class="login-content">
      <!-- Logo -->
      <div class="logo-section">
        <van-icon name="museum-o" size="80" color="#1989fa" />
        <h1 class="app-name">逛博</h1>
        <p class="app-slogan">发现身边的博物馆，记录每一次文化之旅</p>
      </div>

      <!-- 登录按钮 -->
      <div class="login-buttons">
        <van-button
          type="primary"
          block
          round
          size="large"
          :loading="loading"
          @click="handleWechatLogin"
        >
          <van-icon name="wechat" />
          微信登录
        </van-button>

        <van-button
          block
          round
          size="large"
          plain
          @click="handleGuest"
        >
          游客模式
        </van-button>
      </div>

      <!-- 用户协议 -->
      <div class="agreement">
        <p>登录即代表同意</p>
        <a href="#">《用户协议》</a>
        <span>和</span>
        <a href="#">《隐私政策》</a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #fff;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.logo-section {
  text-align: center;
  margin-bottom: 60px;

  .app-name {
    font-size: 32px;
    font-weight: 600;
    color: #323233;
    margin-top: 16px;
  }

  .app-slogan {
    font-size: 14px;
    color: #646566;
    margin-top: 8px;
  }
}

.login-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .van-button {
    :deep(.van-icon) {
      margin-right: 8px;
    }
  }
}

.agreement {
  margin-top: 40px;
  font-size: 12px;
  color: #969799;
  text-align: center;

  a {
    color: #1989fa;
    text-decoration: none;
  }
}
</style>