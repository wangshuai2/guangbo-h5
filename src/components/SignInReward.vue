<script setup lang="ts">
import { computed } from 'vue'

interface Reward {
  day: number
  type: 'exp' | 'points' | 'medal' | 'chest'
  value: number
  name: string
  icon: string
  claimed: boolean
  current: boolean
}

interface Props {
  rewards: Reward[]
  continuousDays: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  claim: [day: number]
}>()

// 奖励类型图标
const typeIcons: Record<string, string> = {
  exp: 'fire-o',
  points: 'points',
  medal: 'medal-o',
  chest: 'gift-o'
}

// 奖励类型颜色
const typeColors: Record<string, string> = {
  exp: '#ff976a',
  points: '#1989fa',
  medal: '#9c27b0',
  chest: '#ff4d4f'
}

// 奖励类型名称
const typeNames: Record<string, string> = {
  exp: '经验',
  points: '积分',
  medal: '勋章',
  chest: '宝箱'
}

const displayRewards = computed(() => {
  return props.rewards.slice(0, 7) // 显示7天奖励
})

function handleClaim(day: number) {
  emit('claim', day)
}
</script>

<template>
  <div class="signin-reward">
    <div class="reward-header">
      <div class="title">
        <van-icon name="gift-o" />
        <span>连续签到奖励</span>
      </div>
      <div class="subtitle">连续签到可获得额外奖励</div>
    </div>

    <div class="reward-list">
      <div
        v-for="reward in displayRewards"
        :key="reward.day"
        class="reward-item"
        :class="{
          'claimed': reward.claimed,
          'current': reward.current,
          'locked': reward.day > continuousDays
        }"
        @click="reward.current && !reward.claimed ? handleClaim(reward.day) : null"
      >
        <div class="day-label">第{{ reward.day }}天</div>
        <div
          class="reward-icon"
          :style="{ backgroundColor: typeColors[reward.type] + '20' }"
        >
          <van-icon
            :name="typeIcons[reward.type]"
            :color="typeColors[reward.type]"
            size="24"
          />
        </div>
        <div class="reward-name">{{ reward.name }}</div>
        <div
          class="reward-value"
          :style="{ color: typeColors[reward.type] }"
        >
          +{{ reward.value }} {{ typeNames[reward.type] }}
        </div>

        <!-- 状态标记 -->
        <div v-if="reward.claimed" class="status-badge claimed">
          <van-icon name="success" />
        </div>
        <div v-else-if="reward.current" class="status-badge current">
          可领取
        </div>
        <div v-else-if="reward.day > continuousDays" class="status-badge locked">
          <van-icon name="lock" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.signin-reward {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.reward-header {
  margin-bottom: 16px;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;

    .van-icon {
      color: #ff976a;
    }
  }

  .subtitle {
    font-size: 12px;
    color: #969799;
  }
}

.reward-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.reward-item {
  flex-shrink: 0;
  width: 80px;
  padding: 12px 8px;
  background-color: #f7f8fa;
  border-radius: 8px;
  text-align: center;
  position: relative;
  transition: all 0.2s;

  &.claimed {
    opacity: 0.6;
  }

  &.current {
    background-color: #fff3e0;
    border: 1px solid #ff976a;
    cursor: pointer;

    &:hover {
      background-color: #ffe0b2;
    }
  }

  &.locked {
    opacity: 0.5;
  }
}

.day-label {
  font-size: 12px;
  color: #646566;
  margin-bottom: 8px;
}

.reward-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
}

.reward-name {
  font-size: 12px;
  color: #323233;
  margin-bottom: 4px;
}

.reward-value {
  font-size: 11px;
  font-weight: 500;
}

.status-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;

  &.claimed {
    background-color: #4caf50;
    color: #fff;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  &.current {
    background-color: #ff976a;
    color: #fff;
  }

  &.locked {
    background-color: #969799;
    color: #fff;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
}
</style>
