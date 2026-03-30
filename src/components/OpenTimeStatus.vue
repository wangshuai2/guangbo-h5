<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OpenTime } from '@/types'

interface Props {
  openTime?: OpenTime
  museumName?: string
}

const props = defineProps<Props>()

// 获取今天是周几（0=周日，1=周一...）
const today = new Date().getDay()
const weekDay = today === 0 ? 'sunday' : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today - 1]

// 今天的开放时间
const todayHours = computed(() => {
  if (!props.openTime) return null
  return props.openTime[weekDay]
})

// 当前状态
const status = computed(() => {
  const hours = todayHours.value
  if (!hours || hours.closed) {
    return { type: 'closed', text: '今日闭馆', color: '#969799' }
  }

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const [openH, openM] = hours.open.split(':').map(Number)
  const [closeH, closeM] = hours.close.split(':').map(Number)
  const openTime = openH * 60 + openM
  const closeTime = closeH * 60 + closeM

  if (currentTime < openTime) {
    const diff = openTime - currentTime
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return { 
      type: 'before', 
      text: `还有 ${hours}小时${mins}分钟 开馆`,
      subText: `${hours.open} 开馆`,
      color: '#ff976a'
    }
  }

  if (currentTime >= openTime && currentTime < closeTime) {
    const diff = closeTime - currentTime
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return { 
      type: 'open', 
      text: '开放中',
      subText: `还有 ${hours}小时${mins}分钟 闭馆`,
      color: '#07c160'
    }
  }

  return { type: 'closed', text: '已闭馆', subText: '明日开放', color: '#969799' }
})

// 本周开放时间
const weekHours = computed(() => {
  if (!props.openTime) return []
  const weekMap: Record<string, string> = {
    monday: '周一',
    tuesday: '周二',
    wednesday: '周三',
    thursday: '周四',
    friday: '周五',
    saturday: '周六',
    sunday: '周日'
  }
  
  return Object.entries(props.openTime).map(([day, hours]) => ({
    day: weekMap[day],
    isToday: day === weekDay,
    hours: hours.closed ? '闭馆' : `${hours.open} - ${hours.close}`
  }))
})

const showDetail = ref(false)
</script>

<template>
  <div class="open-time-status">
    <!-- 今日状态 -->
    <div class="today-status" :class="status.type" @click="showDetail = !showDetail">
      <div class="status-icon">
        <van-icon 
          :name="status.type === 'open' ? 'clock' : 'clock-o'" 
          size="20" 
        />
      </div>
      <div class="status-content">
        <div class="status-text" :style="{ color: status.color }">
          {{ status.text }}
        </div>
        <div v-if="status.subText" class="status-sub">
          {{ status.subText }}
        </div>
      </div>
      <van-icon :name="showDetail ? 'arrow-up' : 'arrow-down'" class="arrow" />
    </div>

    <!-- 详细时间 -->
    <div v-if="showDetail" class="week-hours">
      <div 
        v-for="item in weekHours" 
        :key="item.day"
        class="week-item"
        :class="{ today: item.isToday }"
      >
        <span class="day-name">{{ item.day }}</span>
        <span class="day-hours">{{ item.hours }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.open-time-status {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.today-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;

  &.open {
    .status-icon {
      color: #07c160;
      background-color: #e8f5e9;
    }
  }

  &.before {
    .status-icon {
      color: #ff976a;
      background-color: #fff3e0;
    }
  }

  &.closed {
    .status-icon {
      color: #969799;
      background-color: #f7f8fa;
    }
  }
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-content {
  flex: 1;
}

.status-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.status-sub {
  font-size: 13px;
  color: #646566;
}

.arrow {
  color: #969799;
  font-size: 16px;
}

.week-hours {
  padding: 0 16px 16px;
  border-top: 1px solid #f5f5f5;
}

.week-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: #646566;

  &.today {
    color: #323233;
    font-weight: 500;

    .day-name {
      color: #1989fa;
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f5f5f5;
  }
}

.day-name {
  width: 40px;
}

.day-hours {
  color: #323233;
}
</style>
