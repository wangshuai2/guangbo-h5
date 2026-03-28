<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface SignInRecord {
  date: string
  signed: boolean
  reward?: {
    type: 'exp' | 'points' | 'medal'
    value: number
    name: string
  }
}

interface Props {
  currentMonth: string // YYYY-MM
  signedDates: string[] // 已签到的日期列表
  todaySigned: boolean
  continuousDays: number
  totalDays: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  signIn: []
  selectDate: [date: string]
}>()

// 当前月份信息
const monthInfo = computed(() => {
  const year = parseInt(props.currentMonth.split('-')[0])
  const month = parseInt(props.currentMonth.split('-')[1]) - 1

  const firstDay = dayjs(new Date(year, month, 1))
  const lastDay = dayjs(new Date(year, month + 1, 0))

  const startDayOfWeek = firstDay.day() // 0 = Sunday
  const daysInMonth = lastDay.date()

  return {
    year,
    month,
    startDayOfWeek,
    daysInMonth,
    monthName: firstDay.format('YYYY年M月')
  }
})

// 生成日历数据
const calendarDays = computed(() => {
  const { startDayOfWeek, daysInMonth } = monthInfo.value
  const days: Array<{ date: string; day: number; isCurrentMonth: boolean; signed: boolean; isToday: boolean }> = []

  // 上个月的日期（填充空白）
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ date: '', day: 0, isCurrentMonth: false, signed: false, isToday: false })
  }

  // 当前月的日期
  const today = dayjs().format('YYYY-MM-DD')
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${props.currentMonth}-${String(i).padStart(2, '0')}`
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      signed: props.signedDates.includes(date),
      isToday: date === today
    })
  }

  return days
})

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function handleSignIn() {
  emit('signIn')
}

function handleSelectDate(date: string) {
  if (!date) return
  emit('selectDate', date)
}
</script>

<template>
  <div class="signin-calendar">
    <div class="calendar-header">
      <div class="month-info">
        <span class="month-name">{{ monthInfo.monthName }}</span>
      </div>
      <div class="signin-stats">
        <div class="stat-item">
          <span class="stat-value">{{ continuousDays }}</span>
          <span class="stat-label">连续签到</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalDays }}</span>
          <span class="stat-label">累计签到</span>
        </div>
      </div>
    </div>

    <div class="calendar-body">
      <!-- 星期标题 -->
      <div class="week-header">
        <div v-for="day in weekDays" :key="day" class="week-day">{{ day }}</div>
      </div>

      <!-- 日期网格 -->
      <div class="days-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            'other-month': !day.isCurrentMonth,
            'signed': day.signed,
            'today': day.isToday,
            'clickable': day.isCurrentMonth && day.date
          }"
          @click="handleSelectDate(day.date)"
        >
          <template v-if="day.isCurrentMonth">
            <span class="day-number">{{ day.day }}</span>
            <div v-if="day.signed" class="signed-mark">
              <van-icon name="success" />
            </div>
            <div v-else-if="day.isToday" class="today-mark">今</div>
          </template>
        </div>
      </div>
    </div>

    <!-- 签到按钮 -->
    <div class="signin-action">
      <van-button
        block
        round
        type="primary"
        size="large"
        :disabled="todaySigned"
        @click="handleSignIn"
      >
        <template v-if="todaySigned">
          <van-icon name="success" />
          今日已签到
        </template>
        <template v-else>
          <van-icon name="sign" />
          立即签到
        </template>
      </van-button>
      <p v-if="!todaySigned" class="signin-hint">
        连续签到 {{ continuousDays + 1 }} 天可获得额外奖励
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.signin-calendar {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .month-info {
    .month-name {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
    }
  }

  .signin-stats {
    display: flex;
    gap: 16px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #1989fa;
      }

      .stat-label {
        font-size: 12px;
        color: #969799;
      }
    }
  }
}

.calendar-body {
  margin-bottom: 20px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;

  .week-day {
    text-align: center;
    font-size: 14px;
    color: #969799;
    padding: 8px 0;
  }
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &.other-month {
    visibility: hidden;
  }

  &.clickable:hover {
    background-color: #f7f8fa;
  }

  &.signed {
    background-color: #e8f5e9;

    .day-number {
      color: #4caf50;
    }
  }

  &.today {
    background-color: #fff3e0;

    .day-number {
      color: #ff976a;
      font-weight: 600;
    }
  }

  .day-number {
    font-size: 14px;
    color: #323233;
  }

  .signed-mark {
    position: absolute;
    bottom: 4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #4caf50;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }

  .today-mark {
    position: absolute;
    bottom: 4px;
    font-size: 10px;
    color: #ff976a;
    font-weight: 600;
  }
}

.signin-action {
  .van-button {
    margin-bottom: 12px;
  }

  .signin-hint {
    text-align: center;
    font-size: 12px;
    color: #969799;
  }
}
</style>
