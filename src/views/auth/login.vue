<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { phoneLogin, sendSmsCode } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import CaptchaButton from '@/components/CaptchaButton.vue'
import type { PnvsValidateResult } from '@/types/pnvs'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const phone = ref('')
const smsCode = ref('')
const countdown = ref(0)
const captchaRef = ref<InstanceType<typeof CaptchaButton> | null>(null)
const pendingCaptchaResult = ref<PnvsValidateResult | null>(null)

// 手机号验证规则
const phoneRegex = /^1[3-9]\d{9}$/
const isPhoneValid = computed(() => phoneRegex.test(phone.value))

// 是否可以获取验证码
const canGetSmsCode = computed(() => isPhoneValid.value && countdown.value === 0)

// 是否可以登录
const canLogin = computed(() => isPhoneValid.value && smsCode.value.length === 6)

// 获取验证码按钮文字
const smsButtonText = computed(() => {
  if (countdown.value > 0) return `${countdown.value}s后重试`
  return '获取验证码'
})

// 验证成功后发送短信验证码
async function handleCaptchaSuccess(result: PnvsValidateResult) {
  pendingCaptchaResult.value = result
  await sendSms(result)
}

// 发送短信验证码
async function sendSms(captchaResult: PnvsValidateResult) {
  if (!isPhoneValid.value) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    const res = await sendSmsCode({
      phone: phone.value,
      captcha: {
        lot_number: captchaResult.lot_number,
        captcha_output: captchaResult.captcha_output,
        pass_token: captchaResult.pass_token,
        gen_time: captchaResult.gen_time,
      },
    })

    if (res.code === 0 && res.data?.success) {
      showToast('验证码已发送')
      startCountdown()
    } else {
      showToast(res.message || '发送失败')
      captchaRef.value?.reset()
    }
  } catch (error) {
    showToast('发送失败，请重试')
    captchaRef.value?.reset()
  }
}

// 倒计时
function startCountdown() {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 验证失败
function handleCaptchaFail() {
  showToast('验证失败，请重试')
}

// 验证出错
function handleCaptchaError(message: string) {
  showToast(message || '验证出错')
}

// 手机号登录
async function handleLogin() {
  if (!canLogin.value) {
    showToast('请输入手机号和验证码')
    return
  }

  loading.value = true
  showLoadingToast({
    message: '登录中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const res = await phoneLogin({
      phone: phone.value,
      smsCode: smsCode.value,
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
    } else {
      showToast(res.message || '登录失败')
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

      <!-- 手机号登录表单 -->
      <div class="login-form">
        <!-- 手机号输入框 -->
        <van-field
          v-model="phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          maxlength="11"
          clearable
          :rules="[{ pattern: phoneRegex, message: '请输入正确的手机号' }]"
        />

        <!-- 验证码输入框 -->
        <van-field
          v-model="smsCode"
          type="digit"
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
          clearable
        >
          <template #button>
            <CaptchaButton
              ref="captchaRef"
              type="primary"
              size="small"
              :text="smsButtonText"
              :disabled="!canGetSmsCode"
              @success="handleCaptchaSuccess"
              @fail="handleCaptchaFail"
              @error="handleCaptchaError"
            />
          </template>
        </van-field>

        <!-- 登录按钮 -->
        <van-button
          type="primary"
          block
          round
          size="large"
          :loading="loading"
          :disabled="!canLogin"
          @click="handleLogin"
        >
          登录
        </van-button>

        <van-button
          block
          round
          size="large"
          plain
          style="margin-top: 12px;"
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

.login-form {
  width: 100%;

  .van-field {
    margin-bottom: 16px;
  }

  .van-button {
    margin-top: 24px;

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