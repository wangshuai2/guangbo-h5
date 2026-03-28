<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { wechatLogin } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import CaptchaButton from '@/components/CaptchaButton.vue'
import type { PnvsValidateResult } from '@/types/pnvs.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const captchaRef = ref<InstanceType<typeof CaptchaButton> | null>(null)

// 验证成功后进行微信登录
async function handleCaptchaSuccess(result: PnvsValidateResult) {
  loading.value = true
  showLoadingToast({
    message: '登录中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // 模拟获取微信 code
    const mockCode = 'mock_wx_code_' + Date.now()

    const res = await wechatLogin({
      code: mockCode,
      userInfo: {
        nickname: '微信用户',
        avatar: 'https://picsum.photos/100/100'
      },
      // 将验证码结果传递给后端进行二次校验
      captcha: {
        lot_number: result.lot_number,
        captcha_output: result.captcha_output,
        pass_token: result.pass_token,
        gen_time: result.gen_time
      }
    })

    if (res.code === 0 && res.data) {
      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data.user)
      showToast({
        type: 'success',
        message: '登录成功'
      })

      // 跳转到之前的页面或首页
      const redirect = route.query.redirect as string
      router.replace(redirect || '/')
    }
  } catch (error) {
    showToast('登录失败')
    // 重置验证码
    captchaRef.value?.reset()
  } finally {
    loading.value = false
    closeToast()
  }
}

// 验证失败
function handleCaptchaFail() {
  showToast('验证失败，请重试')
}

// 验证出错
function handleCaptchaError(message: string) {
  showToast(message || '验证出错')
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
        <!-- 图形验证码按钮（验证通过后自动触发微信登录） -->
        <CaptchaButton
          ref="captchaRef"
          type="primary"
          text="微信登录"
          :disabled="loading"
          @success="handleCaptchaSuccess"
          @fail="handleCaptchaFail"
          @error="handleCaptchaError"
        >
          <template #default>
            <van-icon name="wechat" />
            <span>微信登录</span>
          </template>
        </CaptchaButton>

        <van-button block round size="large" plain @click="handleGuest">游客模式</van-button>
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
