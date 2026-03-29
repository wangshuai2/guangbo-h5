<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  level: number
  exp: number
  levelExp: number // 当前等级所需经验
}

const props = defineProps<Props>()

// 计算进度百分比
const progress = computed(() => {
  if (props.levelExp <= 0) return 0
  return Math.min(100, Math.round((props.exp / props.levelExp) * 100))
})

// 等级称号
const levelTitle = computed(() => {
  const titles: Record<number, string> = {
    1: '博物馆新手',
    2: '博物馆爱好者',
    3: '博物馆探索家',
    4: '博物馆达人',
    5: '博物馆专家',
    6: '博物馆大师',
    7: '博物馆传奇',
    8: '博物馆守护者',
    9: '博物馆之神',
    10: '博物馆传说',
  }
  return titles[props.level] || `Lv.${props.level}`
})

// 下一级所需经验
const nextLevelExp = computed(() => {
  return props.levelExp - props.exp
})
</script>

<template>
  <div class="level-progress">
    <div class="level-header">
      <span class="level-title">{{ levelTitle }}</span>
      <span class="level-text">Lv.{{ level }}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
    <div class="exp-info">
      <span>{{ exp }}/{{ levelExp }} 经验</span>
      <span v-if="nextLevelExp > 0">还需 {{ nextLevelExp }} 经验升级</span>
      <span v-else>已满级</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.level-progress {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .level-title {
    font-size: 16px;
    font-weight: 600;
  }

  .level-text {
    font-size: 14px;
    opacity: 0.9;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
  }
}

.progress-bar {
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffd700, #ffed4e);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
}

.exp-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.8;
}
</style>
