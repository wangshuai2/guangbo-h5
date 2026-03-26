/**
 * 阿里云 PNVS 图形验证码 Composable
 * 用于在 Vue 组件中方便地集成图形验证码
 */
import { ref, onUnmounted } from 'vue'
import type { PnvsCaptchaObject, PnvsValidateResult, PnvsFailObject, PnvsErrorObject } from '@/types/pnvs'

/** PNVS 配置 */
const PNVS_CONFIG = {
  appId: 'd75b9dca0d62b49c157730afa489eae2',
  // appKey 仅用于后端验证，前端不需要
}

export interface UseCaptchaOptions {
  /** 验证成功回调 */
  onSuccess?: (result: PnvsValidateResult) => void
  /** 验证失败回调 */
  onFail?: (failObj: PnvsFailObject) => void
  /** 验证出错回调 */
  onError?: (error: PnvsErrorObject) => void
  /** 用户关闭验证回调 */
  onClose?: () => void
}

export interface UseCaptchaReturn {
  /** 是否已准备就绪 */
  isReady: ReturnType<typeof ref<boolean>>
  /** 是否正在验证中 */
  isValidating: ReturnType<typeof ref<boolean>>
  /** 验证结果 */
  validateResult: ReturnType<typeof ref<PnvsValidateResult | null>>
  /** 错误信息 */
  errorMessage: ReturnType<typeof ref<string>>
  /** 调起验证码 */
  showCaptcha: () => void
  /** 重置验证状态 */
  reset: () => void
  /** 获取验证结果 */
  getValidateResult: () => PnvsValidateResult | null
}

/**
 * 使用阿里云 PNVS 图形验证码
 * @param options 配置选项
 */
export function useCaptcha(options: UseCaptchaOptions = {}): UseCaptchaReturn {
  const isReady = ref(false)
  const isValidating = ref(false)
  const validateResult = ref<PnvsValidateResult | null>(null)
  const errorMessage = ref('')

  let captchaObj: PnvsCaptchaObject | null = null

  // 初始化验证码
  const initCaptcha = () => {
    if (!window.initAlicom4) {
      errorMessage.value = '验证码 SDK 未加载'
      console.error('[useCaptcha] initAlicom4 is not defined')
      return
    }

    window.initAlicom4(
      {
        captchaId: PNVS_CONFIG.appId,
        product: 'bind',
      },
      (captcha) => {
        captchaObj = captcha

        captcha
          .onNextReady(() => {
            isReady.value = true
            console.log('[useCaptcha] 验证码已准备就绪')
          })
          .onSuccess(() => {
            isValidating.value = false
            const result = captcha.getValidate()
            if (result) {
              validateResult.value = result
              console.log('[useCaptcha] 验证成功', result)
              options.onSuccess?.(result)
            }
          })
          .onFail((failObj) => {
            isValidating.value = false
            console.warn('[useCaptcha] 验证失败', failObj)
            options.onFail?.(failObj)
          })
          .onError((error) => {
            isValidating.value = false
            errorMessage.value = error.msg || '验证出错'
            console.error('[useCaptcha] 验证出错', error)
            options.onError?.(error)
          })
          .onClose(() => {
            isValidating.value = false
            console.log('[useCaptcha] 用户关闭验证')
            options.onClose?.()
          })
      }
    )
  }

  // 调起验证码
  const showCaptcha = () => {
    if (!captchaObj) {
      console.error('[useCaptcha] 验证码未初始化')
      return
    }
    if (!isReady.value) {
      console.warn('[useCaptcha] 验证码未准备就绪')
      return
    }
    isValidating.value = true
    captchaObj.showCaptcha()
  }

  // 重置验证状态
  const reset = () => {
    if (captchaObj) {
      captchaObj.reset()
    }
    validateResult.value = null
    errorMessage.value = ''
    isValidating.value = false
  }

  // 获取验证结果
  const getValidateResult = () => validateResult.value

  // 初始化
  initCaptcha()

  // 组件卸载时销毁验证码实例
  onUnmounted(() => {
    if (captchaObj) {
      captchaObj.destroy()
      captchaObj = null
    }
  })

  return {
    isReady,
    isValidating,
    validateResult,
    errorMessage,
    showCaptcha,
    reset,
    getValidateResult,
  }
}