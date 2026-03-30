<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface Props {
  openTime?: string | { open: string; close: string }
  closeTime?: string
  status?: 'open' | 'closed' | 'holiday'
  holidayName?: string
}

const props = withDefaults(defineProps<Props>(), {
  openTime: '09:00',
  closeTime: '17:00',
  status: 'open'
})

const now = dayjs()

// 解析开放时间
const openHour = computed(() => {
  if (typeof props.openTime === 'string') {
    return props.openTime
  }
  return props.openTime?.open || '09:00'
})

const closeHour = computed(() => {
  if (typeof props.closeTime === 'string') {
    return props.closeTime
  }
  if (typeof props.openTime === 'object' && props.openTime?.close) {
    return props.openTime.close
  }
  return '17:00'
})

// 是否开放中
const isOpenNow = computed(() => {
  if (props.status === 'holiday') return false
  
  const currentTime = now.format('HH:mm')
  return currentTime >= openHour.value && currentTime <= closeHour.value
})

// 状态配置
const statusConfig = computed(() => {
  if (props.status === 'holiday') {
    return {
      text: '节假日闭馆',
      color: '#ff976a',
      icon: 'info-o',
      bgClass: 'holiday'
    }
  }
  
  if (isOpenNow.value) {
    return {
      text: '开放中',
      color: '#07c160',
      icon: 'clock',
      bgClass: 'open'
    }
  }
  
  return {
    text: '已闭馆',
    color: '#969799',
    icon: 'clock-o',
    bgClass: 'closed'
  }
})

// 剩余时间
const remainingTime = computed(() => {
  if (!isOpenNow.value) return ''
  
  const close = dayjs(`${now.format('YYYY-MM-DD')} ${closeHour.value}`)
  const diff = close.diff(now, 'minute')
  
  if (diff <= 0) return ''
  if (diff < 60) return `距闭馆 ${diff} 分钟`
  
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `距闭馆 ${hours}小时${mins}分钟`
})
</script>

<template>
  <div class="open-status" :class="statusConfig.bgClass">
    <div class="status-icon">
      <van-icon :name="statusConfig.icon" :color="statusConfig.color" size="20" />
    </div>
    <div class="status-info">
      <div class="status-text" :style="{ color: statusConfig.color }">
        {{ statusConfig.text }}
      </div>
      <div class="time-info">
        <template v-if="status === 'holiday' && holidayName">
          {{ holidayName }}
        </template>
        <template v-else>
          {{ openHour }} - {{ closeHour }}
          <span v-if="remainingTime" class="remaining">{{ remainingTime }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.open-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;

  &.open {
    background-color: #f0fff4;
  }

  &.closed {
    background-color: #f7f8fa;
  }

  &.holiday {
    background-color: #fffbe8;
  }
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.time-info {
  font-size: 12px;
  color: #646566;

  .remaining {
    margin-left: 8px;
    color: #ff976a;
  }
}
</style>