<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast } from 'vant'
import LevelProgress from '@/components/LevelProgress.vue'

const router = useRouter()

const loading = ref(false)
const currentLevel = ref(3)
const currentExp = ref(750)
const levelExp = ref(1000)
const totalExp = ref(2750)

// 等级列表
const levels = ref([
  { level: 1, name: '博物馆新手', minExp: 0, maxExp: 100, icon: '🌱', color: '#4caf50' },
  { level: 2, name: '博物馆爱好者', minExp: 100, maxExp: 300, icon: '🌿', color: '#8bc34a' },
  { level: 3, name: '博物馆探索家', minExp: 300, maxExp: 1000, icon: '🌳', color: '#ffc107' },
  { level: 4, name: '博物馆达人', minExp: 1000, maxExp: 2500, icon: '🏛️', color: '#ff9800' },
  { level: 5, name: '博物馆专家', minExp: 2500, maxExp: 5000, icon: '👨‍🎓', color: '#ff5722' },
  { level: 6, name: '博物馆大师', minExp: 5000, maxExp: 10000, icon: '🎓', color: '#9c27b0' },
  { level: 7, name: '博物馆传奇', minExp: 10000, maxExp: 20000, icon: '👑', color: '#673ab7' },
  { level: 8, name: '博物馆守护者', minExp: 20000, maxExp: 50000, icon: '🛡️', color: '#3f51b5' },
  { level: 9, name: '博物馆之神', minExp: 50000, maxExp: 100000, icon: '⭐', color: '#2196f3' },
  { level: 10, name: '博物馆传说', minExp: 100000, maxExp: 999999, icon: '🌟', color: '#00bcd4' }
])

// 经验获取方式
const expSources = ref([
  { action: '每日签到', exp: 10, icon: 'sign', color: '#4caf50' },
  { action: '打卡博物馆', exp: 50, icon: 'location', color: '#2196f3' },
  { action: '分享足迹', exp: 20, icon: 'share', color: '#ff9800' },
  { action: '获得点赞', exp: 5, icon: 'like', color: '#e91e63' },
  { action: '完善资料', exp: 30, icon: 'user', color: '#9c27b0' }
])

// 当前等级信息
const currentLevelInfo = computed(() => {
  return levels.value.find(l => l.level === currentLevel.value) || levels.value[0]
})

// 下一等级信息
const nextLevelInfo = computed(() => {
  return levels.value.find(l => l.level === currentLevel.value + 1)
})

// 获取等级数据
async function fetchLevelData() {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // TODO: 使用真实 API
    // const res = await getUserLevel()
    // if (res.code === 0 && res.data) {
    //   currentLevel.value = res.data.level
    //   currentExp.value = res.data.exp
    //   levelExp.value = res.data.levelExp
    //   totalExp.value = res.data.totalExp
    // }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

onMounted(() => {
  fetchLevelData()
})
</script>

<template>
  <div class="level-page">
    <van-nav-bar
      title="等级系统"
      left-arrow
      @click-left="router.back()"
    />

    <div class="page-content">
      <!-- 当前等级卡片 -->
      <div class="level-card">
        <div class="level-header">
          <div class="level-icon">{{ currentLevelInfo.icon }}</div>
          <div class="level-info">
            <div class="level-name">{{ currentLevelInfo.name }}</div>
            <div class="level-number">Lv.{{ currentLevel }}</div>
          </div>
        </div>
        
        <LevelProgress
          :level="currentLevel"
          :exp="currentExp"
          :level-exp="levelExp"
        />
        
        <div class="exp-stats">
          <div class="stat-item">
            <div class="stat-value">{{ totalExp }}</div>
            <div class="stat-label">累计经验</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ levelExp - currentExp }}</div>
            <div class="stat-label">升级还需</div>
          </div>
        </div>
      </div>

      <!-- 等级列表 -->
      <div class="levels-section">
        <div class="section-title">等级体系</div>
        <div class="levels-list">
          <div
            v-for="level in levels"
            :key="level.level"
            class="level-item"
            :class="{ 
              current: level.level === currentLevel,
              unlocked: level.level <= currentLevel,
              locked: level.level > currentLevel
            }"
          >
            <div class="level-icon-small" :style="{ backgroundColor: level.color + '20' }">
              {{ level.icon }}
            </div>
            <div class="level-info-small">
              <div class="level-name-small">{{ level.name }}</div>
              <div class="level-exp">{{ level.minExp }} - {{ level.maxExp }} 经验</div>
            </div>
            <div v-if="level.level <= currentLevel" class="unlock-badge">
              <van-icon name="success" />
            </div>
            <div v-else class="lock-badge">
              <van-icon name="lock" />
            </div>
          </div>
        </div>
      </div>

      <!-- 经验获取方式 -->
      <div class="exp-sources-section">
        <div class="section-title">如何获取经验</div>
        <div class="sources-list">
          <div
            v-for="source in expSources"
            :key="source.action"
            class="source-item"
          >
            <div class="source-icon" :style="{ backgroundColor: source.color + '20' }">
              <van-icon :name="source.icon" :color="source.color" />
            </div>
            <div class="source-info">
              <div class="source-action">{{ source.action }}</div>
              <div class="source-exp">+{{ source.exp }} 经验</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.level-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 12px;
}

.level-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 16px;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.level-icon {
  font-size: 48px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-info {
  flex: 1;
}

.level-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.level-number {
  font-size: 14px;
  opacity: 0.8;
}

.exp-stats {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.levels-section,
.exp-sources-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 16px;
}

.levels-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f7f8fa;
  
  &.current {
    background-color: #e8f4fd;
    border: 1px solid #1989fa;
  }
  
  &.unlocked {
    opacity: 1;
  }
  
  &.locked {
    opacity: 0.5;
  }
}

.level-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.level-info-small {
  flex: 1;
}

.level-name-small {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 2px;
}

.level-exp {
  font-size: 12px;
  color: #969799;
}

.unlock-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #07c160;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.lock-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #c8c9cc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
}

.source-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-info {
  flex: 1;
}

.source-action {
  font-size: 14px;
  color: #323233;
  margin-bottom: 2px;
}

.source-exp {
  font-size: 12px;
  color: #ff976a;
  font-weight: 500;
}
</style>
