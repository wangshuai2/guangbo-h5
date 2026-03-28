<script setup lang="ts">
import { computed } from 'vue'

import type { Medal, MedalRarity } from '@/types'

interface DisplayMedal {
  id: number
  name: string
  icon: string
  description: string
  unlockedAt?: string
  rarity: MedalRarity
}

interface Props {
  medals: Medal[]
  maxDisplay?: number
}

// 转换 Medal 为 DisplayMedal
function convertMedal(medal: Medal): DisplayMedal {
  return {
    id: medal.id,
    name: medal.name,
    icon: medal.icon,
    description: medal.description,
    unlockedAt: medal.unlockedAt,
    rarity: medal.rarity
  }
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 6
})

// 稀有度颜色
const rarityColors: Record<string, string> = {
  common: '#969799',
  rare: '#1989fa',
  epic: '#9c27b0',
  legendary: '#ff976a'
}

// 稀有度名称
const rarityNames: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
}

// 显示的勋章
const displayMedals = computed((): DisplayMedal[] => {
  return props.medals.slice(0, props.maxDisplay).map(convertMedal)
})

// 已解锁数量
const unlockedCount = computed(() => {
  return props.medals.filter(m => m.unlockedAt).length
})

const emit = defineEmits<{
  click: [medal: DisplayMedal]
  more: []
}>()

function handleClick(medal: DisplayMedal) {
  emit('click', medal)
}

function handleMore() {
  emit('more')
}
</script>

<template>
  <div class="medal-wall">
    <div class="wall-header">
      <div class="title">
        <van-icon name="medal-o" />
        <span>成就勋章</span>
      </div>
      <div class="count">
        <span class="unlocked">{{ unlockedCount }}</span>
        <span>/</span>
        <span>{{ medals.length }}</span>
      </div>
    </div>

    <div class="medal-grid">
      <div
        v-for="medal in displayMedals"
        :key="medal.id"
        class="medal-item"
        :class="{ locked: !medal.unlockedAt }"
        @click="handleClick(medal)"
      >
        <div
          class="medal-icon"
          :style="{ backgroundColor: rarityColors[medal.rarity] + '20' }"
        >
          <img v-if="medal.icon" :src="medal.icon" :alt="medal.name" />
          <van-icon v-else name="medal" :color="rarityColors[medal.rarity]" size="28" />
        </div>
        <div class="medal-name">{{ medal.name }}</div>
        <div
          class="medal-rarity"
          :style="{ color: rarityColors[medal.rarity] }"
        >
          {{ rarityNames[medal.rarity] }}
        </div>
        <div v-if="!medal.unlockedAt" class="lock-overlay">
          <van-icon name="lock" />
        </div>
      </div>

      <!-- 更多按钮 -->
      <div v-if="medals.length > maxDisplay" class="medal-item more" @click="handleMore">
        <div class="medal-icon more-icon">
          <van-icon name="arrow" size="28" />
        </div>
        <div class="medal-name">查看更多</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.medal-wall {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin: 12px;
}

.wall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #323233;

    .van-icon {
      color: #ff976a;
    }
  }

  .count {
    font-size: 14px;
    color: #969799;

    .unlocked {
      color: #1989fa;
      font-weight: 600;
    }
  }
}

.medal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.medal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;

  &.locked {
    opacity: 0.5;
  }

  &.more {
    .more-icon {
      background-color: #f7f8fa;
      color: #969799;
    }
  }
}

.medal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.medal-name {
  font-size: 12px;
  color: #323233;
  text-align: center;
  margin-bottom: 4px;
}

.medal-rarity {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  background-color: #f7f8fa;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>
