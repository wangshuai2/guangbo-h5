<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'
import SignInCalendar from '@/components/SignInCalendar.vue'
import SignInReward from '@/components/SignInReward.vue'

const router = useRouter()

// 签到状态
const currentMonth = ref(dayjs().format('YYYY-MM'))
const signedDates = ref<string[]>([])
const todaySigned = ref(false)
const continuousDays = ref(0)
const totalDays = ref(0)

// 今日奖励（转换为 SignInReward 组件需要的格式）
const todayRewards = ref([
  { day: 1, type: 'exp' as const, value: 10, name: '每日签到', icon: 'fire-o', claimed: false, current: true },
  { day: 2, type: 'exp' as const, value: 10, name: '每日签到', icon: 'fire-o', claimed: false, current: false },
  { day: 3, type: 'points' as const, value: 30, name: '连续3天', icon: 'points', claimed: false, current: false },
  { day: 4, type: 'exp' as const, value: 10, name: '每日签到', icon: 'fire-o', claimed: false, current: false },
  { day: 5, type: 'exp' as const, value: 10, name: '每日签到', icon: 'fire-o', claimed: false, current: false },
  { day: 6, type: 'exp' as const, value: 10, name: '每日签到', icon: 'fire-o', claimed: false, current: false },
  { day: 7, type: 'points' as const, value: 100, name: '连续7天', icon: 'points', claimed: false, current: false },
])

// 连续签到奖励规则
const continuousRewards = [
  { days: 3, reward: '30积分', icon: 'points' },
  { days: 7, reward: '100积分', icon: 'points' },
  { days: 15, reward: '限定徽章', icon: 'medal' },
  { days: 30, reward: '神秘礼盒', icon: 'gift' },
]

// 加载签到数据
async function loadSignInData() {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    signedDates.value = [
      dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    ]
    todaySigned.value = false
    continuousDays.value = 2
    totalDays.value = 15
  } catch (error) {
    showToast('加载失败')
  } finally {
    closeToast()
  }
}

// 签到
async function handleSignIn() {
  if (todaySigned.value) {
    showToast('今日已签到')
    return
  }

  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const today = dayjs().format('YYYY-MM-DD')
    signedDates.value.push(today)
    todaySigned.value = true
    continuousDays.value++
    totalDays.value++
    
    showToast({
      type: 'success',
      message: '签到成功！获得 10 经验值 + 5 积分',
    })
  } catch (error) {
    showToast('签到失败')
  }
}

// 选择日期
function handleSelectDate(date: string) {
  const isSigned = signedDates.value.includes(date)
  if (isSigned) {
    showToast(`${date} 已签到`)
  } else {
    showToast(`${date} 未签到`)
  }
}

// 返回
function goBack() {
  router.back()
}

onMounted(() => {
  loadSignInData()
})
</script>

<template>
  <div class="signin-page">
    <van-nav-bar
      title="每日签到"
      left-arrow
      @click-left="goBack"
    />

    <div class="page-content">
      <!-- 签到日历 -->
      <SignInCalendar
        :current-month="currentMonth"
        :signed-dates="signedDates"
        :today-signed="todaySigned"
        :continuous-days="continuousDays"
        :total-days="totalDays"
        @sign-in="handleSignIn"
        @select-date="handleSelectDate"
      />

      <!-- 今日奖励 -->
      <SignInReward :rewards="todayRewards" :continuous-days="continuousDays" />

      <!-- 连续签到奖励 -->
      <div class="continuous-rewards">
        <h3 class="section-title">连续签到奖励</h3>
        <div class="rewards-list">
          <div
            v-for="item in continuousRewards"
            :key="item.days"
            class="reward-item"
            :class="{ achieved: continuousDays >= item.days }"
          >
            <div class="reward-icon">
              <van-icon :name="item.icon" size="24" />
            </div>
            <div class="reward-info">
              <div class="reward-days">连续 {{ item.days }} 天</div>
              <div class="reward-name">{{ item.reward }}</div>
            </div>
            <van-icon
              v-if="continuousDays >= item.days"
              name="success"
              class="achieved-icon"
            />
          </div>
        </div>
      </div>

      <!-- 签到规则 -->
      <div class="signin-rules">
        <h3 class="section-title">签到规则</h3>
        <div class="rules-content">
          <p>1. 每日签到可获得 10 经验值 + 5 积分</p>
          <p>2. 连续签到可获得额外奖励</p>
          <p>3. 断签后连续天数将重新计算</p>
          <p>4. 签到记录以服务器时间为准</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.signin-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.continuous-rewards {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;

  .rewards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reward-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: #f7f8fa;
    border-radius: 8px;

    &.achieved {
      background-color: #e8f5e9;
      border: 1px solid #4caf50;
    }

    .reward-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff976a;
    }

    .reward-info {
      flex: 1;

      .reward-days {
        font-size: 13px;
        color: #969799;
        margin-bottom: 4px;
      }

      .reward-name {
        font-size: 15px;
        font-weight: 600;
        color: #323233;
      }
    }

    .achieved-icon {
      color: #4caf50;
      font-size: 20px;
    }
  }
}

.signin-rules {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;

  .rules-content {
    p {
      font-size: 13px;
      color: #646566;
      line-height: 1.8;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
