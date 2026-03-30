<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import { getTeamList, getMyTeams, joinTeam, leaveTeam } from '@/api/team'
import { useUserStore } from '@/stores/user'
import type { Team } from '@/api/team'

const router = useRouter()
const userStore = useUserStore()

const teams = ref<Team[]>([])
const myTeams = ref<Team[]>([])
const loading = ref(true)
const activeTab = ref<'all' | 'my'>('all')

const isLoggedIn = computed(() => userStore.isLoggedIn)

// 加载队伍列表
async function loadTeams() {
  try {
    const res = await getTeamList()
    if (res.code === 0 && res.data) {
      teams.value = res.data.list || []
    }
  } catch (error) {
    showToast('加载失败')
  }
}

// 加载我的队伍
async function loadMyTeams() {
  if (!isLoggedIn.value) return
  try {
    const res = await getMyTeams()
    if (res.code === 0 && res.data) {
      myTeams.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载我的队伍失败', error)
  }
}

// 加载全部
async function loadAll() {
  loading.value = true
  await Promise.all([loadTeams(), loadMyTeams()])
  loading.value = false
  closeToast()
}

// 创建队伍
function createTeam() {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  router.push('/team/create')
}

// 查看详情
function goToDetail(id: number) {
  router.push(`/team/${id}`)
}

// 加入队伍
async function handleJoin(team: Team) {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }

  try {
    await joinTeam(team.id)
    showToast('加入成功')
    team.currentMembers++
    loadMyTeams()
  } catch (error) {
    showToast('加入失败')
  }
}

// 退出队伍
async function handleLeave(team: Team) {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出这个队伍吗？',
  }).then(async () => {
    try {
      await leaveTeam(team.id)
      showToast('已退出')
      team.currentMembers--
      loadMyTeams()
    } catch (error) {
      showToast('操作失败')
    }
  }).catch(() => {})
}

// 是否已加入
function isJoined(team: Team) {
  return myTeams.value.some(t => t.id === team.id)
}

// 格式化时间
function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 状态文字
function getStatusText(status: string) {
  const map: Record<string, string> = {
    recruiting: '招募中',
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

// 状态颜色
function getStatusType(status: string) {
  const map: Record<string, string> = {
    recruiting: 'primary',
    active: 'success',
    completed: 'default',
    cancelled: 'danger',
  }
  return map[status] || 'default'
}

onMounted(() => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  loadAll()
})
</script>

<template>
  <div class="team-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="组队打卡">
      <template #right>
        <van-icon name="plus" size="20" @click="createTeam" />
      </template>
    </van-nav-bar>

    <!-- 标签切换 -->
    <van-tabs v-model:active="activeTab">
      <van-tab name="all" title="全部队伍" />
      <van-tab name="my" title="我的队伍" />
    </van-tabs>

    <!-- 队伍列表 -->
    <div class="team-content" v-if="!loading">
      <div class="team-list">
        <div
          v-for="team in (activeTab === 'my' ? myTeams : teams)"
          :key="team.id"
          class="team-card"
          @click="goToDetail(team.id)"
        >
          <!-- 博物馆封面 -->
          <van-image
            :src="team.museumCover"
            width="100%"
            height="120"
            fit="cover"
            radius="12"
          />
          
          <!-- 信息 -->
          <div class="team-info">
            <div class="team-header">
              <div class="team-name">{{ team.name }}</div>
              <van-tag :type="getStatusType(team.status)" size="small">
                {{ getStatusText(team.status) }}
              </van-tag>
            </div>
            
            <div class="team-meta">
              <span class="museum-name">
                <van-icon name="location-o" size="12" />
                {{ team.museumName }}
              </span>
              <span class="schedule">
                <van-icon name="clock-o" size="12" />
                {{ formatTime(team.scheduledAt) }}
              </span>
            </div>

            <div class="team-members">
              <div class="member-avatars">
                <van-image
                  v-for="(m, i) in team.members.slice(0, 5)"
                  :key="m.id"
                  :src="m.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
                  width="24"
                  height="24"
                  round
                  fit="cover"
                  :style="{ marginLeft: i > 0 ? '-8px' : 0 }"
                />
                <span v-if="team.currentMembers > 5" class="more">
                  +{{ team.currentMembers - 5 }}
                </span>
              </div>
              <span class="member-count">{{ team.currentMembers }}/{{ team.maxMembers }}人</span>
            </div>

            <!-- 操作按钮 -->
            <div class="team-actions" v-if="team.status === 'recruiting'">
              <van-button
                v-if="!isJoined(team)"
                type="primary"
                size="small"
                round
                @click.stop="handleJoin(team)"
              >
                加入队伍
              </van-button>
              <van-button
                v-else
                type="default"
                size="small"
                round
                @click.stop="handleLeave(team)"
              >
                退出队伍
              </van-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty
        v-if="(activeTab === 'my' ? myTeams : teams).length === 0"
        :description="activeTab === 'my' ? '还没有加入队伍' : '暂无队伍'"
      >
        <van-button v-if="activeTab === 'all'" type="primary" round @click="createTeam">
          创建队伍
        </van-button>
      </van-empty>
    </div>

    <!-- 浮动按钮 -->
    <div class="fab" @click="createTeam">
      <van-icon name="plus" size="24" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.team-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  padding-bottom: 80px;
}

.team-content {
  padding: 12px;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .team-info {
    padding: 12px;

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .team-name {
        font-size: 16px;
        font-weight: 600;
        color: #2c2c2e;
      }
    }

    .team-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 12px;
      color: #8e8e93;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .team-members {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .member-avatars {
        display: flex;
        align-items: center;

        .more {
          margin-left: 4px;
          font-size: 12px;
          color: #8e8e93;
        }
      }

      .member-count {
        font-size: 13px;
        color: #8b5a2b;
        font-weight: 500;
      }
    }

    .team-actions {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f5f5f7;
    }
  }
}

.fab {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5a2b, #d4a574);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(139, 90, 43, 0.4);
  cursor: pointer;
}
</style>
