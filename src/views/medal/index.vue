<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { getMedalList } from '@/api/medal'
import type { Medal } from '@/types'

const medals = ref<Medal[]>([])
const loading = ref(true)
const activeTab = ref('all')

async function fetchMedals() {
  try {
    const res = await getMedalList()
    if (res.code === 0 && res.data) {
      medals.value = res.data.list
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

const rarityColors: Record<string, string> = {
  common: '#969799',
  rare: '#1989fa',
  epic: '#7232dd',
  legendary: '#ff976a'
}

const rarityNames: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
}

function getProgressPercent(medal: Medal): number {
  if (!medal.progress) return 0
  return Math.round((medal.progress.current / medal.progress.target) * 100)
}

onMounted(() => {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })
  fetchMedals()
})
</script>

<template>
  <div class="medal-page">
    <van-nav-bar title="我的勋章" />

    <div class="stats-card">
      <div class="stats-item">
        <div class="stats-value">{{ medals.filter(m => m.isUnlocked).length }}</div>
        <div class="stats-label">已解锁</div>
      </div>
      <div class="stats-divider"></div>
      <div class="stats-item">
        <div class="stats-value">{{ medals.length }}</div>
        <div class="stats-label">全部勋章</div>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" sticky>
      <van-tab name="all" title="全部" />
      <van-tab name="checkin" title="打卡" />
      <van-tab name="province" title="省份" />
      <van-tab name="special" title="特殊" />
    </van-tabs>

    <div class="medal-list">
      <van-loading v-if="loading" size="24px">加载中...</van-loading>

      <div
        v-for="medal in medals.filter((m: Medal) => activeTab === 'all' || m.type === activeTab)"
        :key="medal.id"
        class="medal-item"
        :class="{ unlocked: medal.isUnlocked }"
      >
        <div class="medal-icon">
          <van-icon name="medal-o" size="40" :color="medal.isUnlocked ? rarityColors[medal.rarity] : '#ccc'" />
        </div>
        <div class="medal-info">
          <div class="medal-name">{{ medal.name }}</div>
          <div class="medal-desc">{{ medal.description }}</div>
          <div class="medal-meta">
            <van-tag :color="rarityColors[medal.rarity]">
              {{ rarityNames[medal.rarity] }}
            </van-tag>
            <span class="exp-reward">+{{ medal.expReward }} 经验</span>
          </div>

          <div v-if="!medal.isUnlocked && medal.progress" class="progress-bar">
            <van-progress
              :percentage="getProgressPercent(medal)"
              stroke-width="4"
              :color="rarityColors[medal.rarity]"
            />
            <span class="progress-text">{{ medal.progress.current }} / {{ medal.progress.target }}</span>
          </div>
        </div>
        <div v-if="medal.isUnlocked" class="unlocked-badge">
          <van-icon name="success" color="#07c160" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.medal-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1989fa 0%, #36d1dc 100%);
  color: white;

  .stats-item {
    text-align: center;

    .stats-value {
      font-size: 32px;
      font-weight: 600;
    }

    .stats-label {
      font-size: 12px;
      opacity: 0.8;
    }
  }

  .stats-divider {
    width: 1px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.3);
    margin: 0 20px;
  }
}

.medal-list {
  padding: 12px;

  .medal-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 12px;

    &.unlocked {
      background: linear-gradient(135deg, #f8fffe 0%, #f0fff4 100%);
      border: 1px solid #07c160;
    }

    .medal-icon {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f7f8fa;
      border-radius: 50%;
    }

    .medal-info {
      flex: 1;

      .medal-name {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 4px;
      }

      .medal-desc {
        font-size: 12px;
        color: #646566;
        margin-bottom: 8px;
      }

      .medal-meta {
        display: flex;
        align-items: center;
        gap: 8px;

        .exp-reward {
          font-size: 12px;
          color: #ff976a;
        }
      }

      .progress-bar {
        margin-top: 8px;

        .progress-text {
          font-size: 10px;
          color: #646566;
        }
      }
    }

    .unlocked-badge {
      flex-shrink: 0;
    }
  }
}
</style>
