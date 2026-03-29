<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

interface OpeningHours {
  openTime: string
  closeTime: string
  isOpen: boolean
  isHoliday: boolean
  holidayName?: string
}

interface Props {
  openingHours: OpeningHours
  museumName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  setReminder: [time: string]
}>()

// 当前时间
const now = ref(dayjs())

// 是否开放中
const isOpenNow = computed(() => {
  if (!props.openingHours.isOpen) return false
  
  const currentTime = now.value.format('HH:mm')
  return currentTime >= props.openingHours.openTime && 
         currentTime <= props.openingHours.closeTime
})

// 距离开放/关闭还有多久
const timeUntil = computed(() => {
  const currentTime = now.value
  const openTime = dayjs(`${currentTime.format('YYYY-MM-DD')} ${props.openingHours.openTime}`)
  const closeTime = dayjs(`${currentTime.format('YYYY-MM-DD')} ${props.openingHours.closeTime}`)
  
  if (!props.openingHours.isOpen) {
    return { type: 'closed', message: '今日闭馆' }
  }
  
  if (currentTime.isBefore(openTime)) {
    const diffMinutes = openTime.diff(currentTime, 'minute')
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return { 
      type: 'before', 
      message: `还有 ${hours}小时${minutes}分钟 开馆`,
      minutes: diffMinutes
    }
  }
  
  if (currentTime.isBefore(closeTime)) {
    const diffMinutes = closeTime.diff(currentTime, 'minute')
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return { 
      type: 'open', 
      message: `还有 ${hours}小时${minutes}分钟 闭馆`,
      minutes: diffMinutes
    }
  }
  
  return { type: 'closed', message: '已闭馆' }
})

// 建议提醒时间
const reminderOptions = computed(() => {
  const options = []
  
  if (timeUntil.value.type === 'before') {
    // 开馆前提醒
    options.push(
      { label: '开馆前30分钟', value: '30', minutes: 30 },
      { label: '开馆前1小时', value: '60', minutes: 60 }
    )
  }
  
  if (timeUntil.value.type === 'open') {
    // 闭馆前提醒
    if (timeUntil.value.minutes && timeUntil.value.minutes > 60) {
      options.push(
        { label: '闭馆前1小时', value: 'before_close_60', minutes: 60 },
        { label: '闭馆前30分钟', value: 'before_close_30', minutes: 30 }
      )
    }
  }
  
  return options
})

const selectedReminder = ref('')

function handleSetReminder() {
  if (selectedReminder.value) {
    emit('setReminder', selectedReminder.value)
  }
}
</script>

<template>
  <div class="opening-hours-reminder">
    <div class="status-header" :class="timeUntil.type">
      <div class="status-icon">
        <van-icon 
          :name="timeUntil.type === 'open' ? 'clock' : 'clock-o'" 
          size="24" 
        />
      </div>
      <div class="status-info">
        <div class="status-text">
          {{ timeUntil.type === 'open' ? '开放中' : '已闭馆' }}
        </div>
        <div class="time-info">
          {{ props.openingHours.openTime }} - {{ props.openingHours.closeTime }}
        </div>
      </div>
    </div>
    
    <div class="countdown-section">
      <div class="countdown-text">{{ timeUntil.message }}</div>
    </div>
    
    <div v-if="reminderOptions.length > 0" class="reminder-section">
      <div class="section-title">设置提醒</div>
      <van-radio-group v-model="selectedReminder" direction="horizontal">
        <van-radio 
          v-for="option in reminderOptions" 
          :key="option.value"
          :name="option.value"
        >
          {{ option.label }}
        </van-radio>
      </van-radio-group>
      <van-button 
        v-if="selectedReminder"
        block 
        round 
        type="primary" 
        size="small"
        @click="handleSetReminder"
      >
        设置提醒
      </van-button>
    </div>
    
    <div v-if="openingHours.isHoliday" class="holiday-notice">
      <van-icon name="info-o" />
      <span>{{ openingHours.holidayName }}期间开放时间可能有调整</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.opening-hours-reminder {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebedf0;
  
  &.open {
    .status-icon {
      color: #07c160;
      background-color: #e8f5e9;
    }
    .status-text {
      color: #07c160;
    }
  }
  
  &.before {
    .status-icon {
      color: #ff976a;
      background-color: #fff3e0;
    }
    .status-text {
      color: #ff976a;
    }
  }
  
  &.closed {
    .status-icon {
      color: #969799;
      background-color: #f7f8fa;
    }
    .status-text {
      color: #969799;
    }
  }
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.time-info {
  font-size: 14px;
  color: #646566;
}

.countdown-section {
  padding: 16px 0;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
}

.countdown-text {
  font-size: 16px;
  color: #323233;
  font-weight: 500;
}

.reminder-section {
  padding-top: 16px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;
  }
  
  .van-radio-group {
    margin-bottom: 12px;
  }
}

.holiday-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background-color: #fffbe8;
  border-radius: 8px;
  font-size: 12px;
  color: #ff976a;
  
  .van-icon {
    font-size: 16px;
  }
}
</style>
