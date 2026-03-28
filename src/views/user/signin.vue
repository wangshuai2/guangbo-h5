<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showDialog } from 'vant'
import SignInCalendar from '@/components/SignInCalendar.vue'
import SignInReward from '@/components/SignInReward.vue'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const todaySigned = ref(false)
const continuousDays = ref(3)
const totalDays = ref(15)
const currentMonth = ref(dayjs().format('YYYY-MM'))
const signedDates = ref<string[]>([
  '2026-03-25',
  '2026-03-26',
  '2026-03-27'
])

// Mock 奖励数据
const rewards = ref<
  Array<{
    day: number
    type: 'exp' | 'points' | 'medal' | 'chest'
    value: number
    name: string
    icon: string
    claimed: boolean
    current: boolean
  }>
>([
  { day: 1, type: 'exp', value: 10, name: '新手签到', icon: 'fire-o', claimed: true, current: false },
  { day: 2, type: 'exp', value: 15, name: '坚持签到', icon: 'fire-o', claimed: true, current: false },
  { day: 3, type: 'points', value: 5, name: '积分奖励', icon: 'points', claimed: false, current: true },
  { day: 4, type: 'exp', value: 20, name: '连续签到', icon: 'fire-o', claimed: false, current: false },
  { day: 5, type: 'points', value: 10, name: '积分奖励', icon: 'points', claimed: false, current: false },
  { day: 6, type: 'exp', value: 25, name: '坚持奖励', icon: 'fire-o', claimed: false, current: false },
  { day: 7, type: 'chest', value: 1, name: '周签到宝箱', icon: 'gift-o', claimed: false, current: false }
])

// 获取签到数据
async function fetchSignInData() {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // TODO: 替换为真实 API
    // const res = await getSignInData()
    // if (res.code === 0 && res.data) {
    //   todaySigned.value = res.data.todaySigned
    //   continuousDays.value = res.data.continuousDays
    //   totalDays.value = res.data.totalDays
    //   signedDates.value = res.data.signedDates
    //   rewards.value = res.data.rewards
    // }

    // 使用 Mock 数据
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
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
    // TODO: 替换为真实 API
    // const res = await signIn()
    // if (res.code === 0 && res.data) {
    //   todaySigned.value = true
    //   continuousDays.value = res.data.continuousDays
    //   totalDays.value = res.data.totalDays
    //   signedDates.value.push(dayjs().format('YYYY-MM-DD'))
    // }

    // Mock 签到
    await new Promise(resolve => setTimeout(resolve, 500))
    todaySigned.value = true
    continuousDays.value++
    totalDays.value++
    signedDates.value.push(dayjs().format('YYYY-MM-DD'))

    // 更新奖励状态
    const todayReward = rewards.value.find(r => r.day === continuousDays.value)
    if (todayReward) {
      todayReward.claimed = true
      todayReward.current = false
      const nextReward = rewards.value.find(r => r.day === continuousDays.value + 1)
      if (nextReward) {
        nextReward.current = true
      }
    }

    showDialog({
      title: '签到成功',
      message: `连续签到 ${continuousDays.value} 天！\n获得经验值 +${10 + continuousDays.value * 2}`,
      confirmButtonText: '知道了',
      confirmButtonColor: '#1989fa'
    })
  } catch (error) {
    showToast('签到失败')
  }
}

// 领取奖励
async function handleClaimReward(day: number) {
  try {
    // TODO: 替换为真实 API
    // await claimReward(day)

    const reward = rewards.value.find(r => r.day === day)
    if (reward) {
      reward.claimed = true
      reward.current = false
      showToast(`领取成功：${reward.name}`)
    }
  } catch (error) {
    showToast('领取失败')
  }
}

// 选择日期
function handleSelectDate(date: string) {
  console.log('Selected date:', date)
}

onMounted(() => {
  fetchSignInData()
})
</script>

<template>
  <div class="signin-page">
    <van-nav-bar
      title="每日签到"
      left-arrow
      @click-left="router.back()"
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

      <!-- 签到奖励 -->
      <SignInReward
        :rewards="rewards"
        :continuous-days="continuousDays"
        @claim="handleClaimReward"
      />

      <!-- 签到规则 -->
      <div class="signin-rules">
        <div class="rules-header">
          <van-icon name="info-o" />
          <span>签到规则</span>
        </div>
        <div class="rules-content">
          <p>1. 每日签到可获得经验值奖励</p>
          <p>2. 连续签到可获得额外奖励</p>
          <p>3. 断签后连续天数将重新计算</p>
          <p>4. 每周连续签到7天可获得宝箱奖励</p>
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

.signin-rules {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;

  .rules-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;

    .van-icon {
      color: #1989fa;
    }
  }

  .rules-content {
    p {
      font-size: 12px;
      color: #646566;
      line-height: 1.8;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
