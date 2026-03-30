<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  openTime?: string // 开放时间 e.g., "09:00"
  closeTime?: string // 闭馆时间 e.g., "17:00"
  closedDays?: number[] // 闭馆日（周几，0=周日） e.g., [1] 表示周一闭馆
  status?: 'open' | 'closed' | 'special' // 特殊状态覆盖
}

const props = withDefaults(defineProps<Props>(), {
  openTime: '09:00',
  closeTime: '17:00',
  closedDays: () => [1], // 默认周一闭馆
  status: undefined,
})

// 计算当前开放状态
const openingStatus = computed(() => {
  // 如果有特殊状态覆盖，直接返回
  if (props.status === 'open') {
    return { text: '营业中', type: 'open' as const }
  }
  if (props.status === 'closed') {
    return { text: '已闭馆', type: 'closed' as const }
  }
  if (props.status === 'special') {
    return { text: '特殊安排', type: 'special' as const }
  }

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  // 解析开放时间
  const [openHour, openMin] = props.openTime.split(':').map(Number)
  const [closeHour, closeMin] = props.closeTime.split(':').map(Number)
  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  // 检查是否是闭馆日
  const dayOfWeek = now.getDay()
  if (props.closedDays.includes(dayOfWeek)) {
    return { text: '今日闭馆', type: 'closed' as const }
  }

  // 判断开放状态
  if (currentTime < openMinutes) {
    // 未到开放时间
    const remainingMinutes = openMinutes - currentTime
    if (remainingMinutes <= 60) {
      return { text: `即将开馆 ${props.openTime}`, type: 'opening' as const }
    }
    return { text: `${props.openTime} 开馆`, type: 'closed' as const }
  }

  if (currentTime >= closeMinutes) {
    // 已过闭馆时间
    return { text: '已闭馆', type: 'closed' as const }
  }

  // 正在开放
  const remainingMinutes = closeMinutes - currentTime
  if (remainingMinutes <= 60) {
    const remaining = Math.ceil(remainingMinutes / 60)
    return { text: `即将闭馆 ${remaining}小时`, type: 'closing' as const }
  }

  return { text: '营业中', type: 'open' as const }
})

// 状态对应的样式
const statusClass = computed(() => {
  return `status-${openingStatus.value.type}`
})

// 状态对应的颜色
const statusColor = computed(() => {
  switch (openingStatus.value.type) {
    case 'open':
      return '#07c160'
    case 'closing':
      return '#ff976a'
    case 'opening':
      return '#1989fa'
    case 'closed':
      return '#969799'
    case 'special':
      return '#ff976a'
    default:
      return '#969799'
  }
})

// 是否显示时间详情
const showTimeDetail = computed(() => {
  return props.openTime && props.closeTime
})

// 检查今天是否闭馆
const isClosedToday = computed(() => {
  const dayOfWeek = new Date().getDay()
  return props.closedDays.includes(dayOfWeek)
})

// 格式化闭馆日
const closedDaysText = computed(() => {
  if (!props.closedDays.length) return ''

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return props.closedDays.map((d) => dayNames[d]).join('、') + '闭馆'
})
</script>

<template>
  <div class="opening-status" :class="statusClass">
    <div class="status-indicator">
      <span class="status-dot" :style="{ backgroundColor: statusColor }"></span>
      <span class="status-text">{{ openingStatus.text }}</span>
    </div>
    <div class="time-detail" v-if="showTimeDetail && !isClosedToday">
      <van-icon name="clock-o" size="12" />
      <span>{{ openTime }} - {{ closeTime }}</span>
    </div>
    <div class="closed-info" v-if="closedDaysText">
      <van-icon name="info-o" size="12" />
      <span>{{ closedDaysText }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.opening-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background-color: #f7f8fa;
  border-radius: 4px;
  font-size: 12px;

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 4px;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-text {
      color: #323233;
      font-weight: 500;
    }
  }

  .time-detail,
  .closed-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #969799;

    .van-icon {
      color: #969799;
    }
  }

  // 不同状态的样式
  &.status-open {
    background-color: #e8f8f0;

    .status-text {
      color: #07c160;
    }
  }

  &.status-closing {
    background-color: #fff7e8;

    .status-text {
      color: #ff976a;
    }
  }

  &.status-opening {
    background-color: #e8f4ff;

    .status-text {
      color: #1989fa;
    }
  }

  &.status-closed {
    background-color: #f7f8fa;

    .status-text {
      color: #969799;
    }
  }

  &.status-special {
    background-color: #fff7e8;

    .status-text {
      color: #ff976a;
    }
  }
}
</style>