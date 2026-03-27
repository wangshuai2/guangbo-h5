<script setup lang="ts">
/**
 * 阿里云 PNVS 图形验证码按钮组件
 * 封装了验证码的初始化、显示、结果处理等逻辑
 * 参考示例: public-demo-vue3/src/App.vue
 */
import { computed } from 'vue'
import { showToast } from 'vant'
import { useCaptcha } from '@/composables/useCaptcha'
import type { PnvsValidateResult, PnvsFailObject, PnvsErrorObject } from '@/types/pnvs'

const props = defineProps<{
  /** 按钮文字 */
  text?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'default' | 'warning' | 'danger'
}>()

const emit = defineEmits<{
  /** 验证成功事件 */
  (e: 'success', result: PnvsValidateResult): void
  /** 验证失败事件 */
  (e: 'fail', failObj: PnvsFailObject): void
  /** 验证出错事件 */
  (e: 'error', error: PnvsErrorObject): void
  /** 用户关闭验证事件 */
  (e: 'close'): void
  /** 验证码准备就绪事件 */
  (e: 'ready'): void
}>()

const { isReady, isValidating, validateResult, showCaptcha, reset } = useCaptcha({
  onSuccess: (result: PnvsValidateResult) => {
    emit('success', result)
  },
  onFail: (failObj: PnvsFailObject) => {
    showToast('验证失败，请重试')
    emit('fail', failObj)
  },
  onError: (error: PnvsErrorObject) => {
    showToast(error.msg || '验证出错')
    emit('error', error)
  },
  onClose: () => {
    emit('close')
  },
  onReady: () => {
    emit('ready')
  }
})

const buttonText = computed(() => {
  if (!isReady.value) return '加载中...'
  if (isValidating.value) return '验证中...'
  return props.text || '点击验证'
})

const isDisabled = computed(() => {
  return props.disabled || !isReady.value || isValidating.value
})

function handleClick() {
  if (isDisabled.value) return
  reset() // 重置之前的验证结果
  showCaptcha()
}

// 暴露方法供父组件调用
defineExpose({
  reset,
  getValidateResult: () => validateResult.value,
  isReady
})
</script>

<template>
  <van-button :type="type || 'default'" :disabled="isDisabled" :loading="isValidating" block round @click="handleClick">
    <van-icon name="shield-o" />
    {{ buttonText }}
  </van-button>
</template>

<style lang="scss" scoped>
.van-button {
  :deep(.van-icon) {
    margin-right: 8px;
  }
}
</style>
