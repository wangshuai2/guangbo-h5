<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CrowdData } from '@/api/crowd'

interface Props {
  data: CrowdData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

// 人流等级配置
const levelConfig: Record<number, { label: string; color: string; icon: string }> = {
  1: { label: '空闲', color: '#07c160', icon: 'smile-o' },
  2: { label: '舒适', color: '#1989fa', icon: 'smile' },
  3: { label: '适中', color: '#ffc107', icon: 'neutral' },
  4: { label: '拥挤', color: '#ff976a', icon: 'sad' },
  5: { label: '爆满', color: '#ff4d4f', icon: 'fire' }
}

const currentLevel = computed(() => levelConfig[props.data.currentLevel])

// 人流百分比
const crowdPercentage = computed(() => {
  return Math.round((props.data.currentCount / props.data.maxCapacity) * 100)
})

// 趋势图标
const trendIcon = computed(() => {
  switch (props.data.trend) {
    case 'up': return 'arrow-up'
    case 'down': return 'arrow-down'
    default: return 'minus'
  }
})

const trendColor = computed(() => {
  switch (props.data.trend) {
    case 'up': return '#ff4d4f'
    case 'down': return '#07c160'
    default: return '#969799'
  }
})

function handleRefresh() {
  emit('refresh')
}
</script>

<template>
  <div class="crowd-flow">
    <div class="crowd-header">
      <div class="crowd-title">
        <van-icon name="chart-trending-o" />
        <span>实时人流</span>
      </div>
      <div class="update-time">
        更新于 {{ data.updateTime }}
        <van-icon name="replay" @click="handleRefresh" />
      </div>
    </div>

    <div class="crowd-status" :style="{ backgroundColor: currentLevel.color + '10' }">
      <div class="status-icon" :style="{ color: currentLevel.color }">
        <van-icon :name="currentLevel.icon" size="48" />
      </div>
      <div class="status-info">
        <div class="status-level" :style="{ color: currentLevel.color }">
          {{ currentLevel.label }}
        </div>
        <div class="status-count">
          {{ data.currentCount }} / {{ data.maxCapacity }} 人
        </div>
      </div>
      <div class="trend-icon" :style="{ color: trendColor }">
        <van-icon :name="trendIcon" />
      </div>
    </div>

    <div class="crowd-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ 
            width: `${crowdPercentage}%`,
            backgroundColor: currentLevel.color 
          }"
        ></div>
      </div>
      <div class="progress-text">{{ crowdPercentage }}% 容量</div>
    </div>

    <div class="crowd-stats">
      <div class="stat-item">
        <div class="stat-label">预计等待</div>
        <div class="stat-value">{{ data.waitTime }} 分钟</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">最佳参观时间</div>
        <div class="stat-value">{{ data.bestVisitTime }}</div>
      </div>
    </div>

    <div v-if="data.peakHours.length > 0" class="peak-hours">
      <div class="peak-title">
        <van-icon name="clock-o" />
        <span>高峰时段</span>
      </div>
      <div class="peak-list">
        <van-tag 
          v-for="hour in data.peakHours" 
          :key="hour"
          type="danger"
        >
          {{ hour }}
        </van-tag>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.crowd-flow {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.crowd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.crowd-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;

  .van-icon {
    color: #1989fa;
  }
}

.update-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #969799;

  .van-icon {
    cursor: pointer;
    padding: 4px;
  }
}

.crowd-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.status-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  flex: 1;
}

.status-level {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-count {
  font-size: 14px;
  color: #646566;
}

.trend-icon {
  font-size: 24px;
}

.crowd-progress {
  margin-bottom: 16px;
}

.progress-bar {
  height: 8px;
  background-color: #ebedf0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: #969799;
}

.crowd-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.peak-hours {
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

.peak-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 8px;

  .van-icon {
    color: #ff976a;
  }
}

.peak-list {
  display: flex;
  gap: 8px;
}
</style>
