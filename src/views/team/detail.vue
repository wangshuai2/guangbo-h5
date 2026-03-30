<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import { getTeamDetail, joinTeam, leaveTeam, kickMember, disbandTeam, teamCheckin } from '@/api/team'
import { useUserStore } from '@/stores/user'
import type { Team } from '@/api/team'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const team = ref<Team | null>(null)
const loading = ref(true)
const isJoined = ref(false)
const isLeader = ref(false)

// 加载队伍详情
async function loadTeam() {
  const id = Number(route.params.id)
  if (!id) return

  try {
    const res = await getTeamDetail(id)
    if (res.code === 0 && res.data) {
      team.value = res.data
      isLeader.value = res.data.leaderId === userStore.userInfo?.id
      isJoined.value = res.data.members.some(m => m.userId === userStore.userInfo?.id)
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 加入队伍
async function handleJoin() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    await joinTeam(team.value!.id)
    showToast('加入成功')
    loadTeam()
  } catch (error) {
    showToast('加入失败')
  }
}

// 退出队伍
async function handleLeave() {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出这个队伍吗？',
  }).then(async () => {
    try {
      await leaveTeam(team.value!.id)
      showToast('已退出')
      router.back()
    } catch (error) {
      showToast('操作失败')
    }
  }).catch(() => {})
}

// 踢出成员
async function handleKick(userId: number) {
  showConfirmDialog({
    title: '确认踢出',
    message: '确定要将该成员踢出队伍吗？',
  }).then(async () => {
    try {
      await kickMember(team.value!.id, userId)
      showToast('已踢出')
      loadTeam()
    } catch (error) {
      showToast('操作失败')
    }
  }).catch(() => {})
}

// 解散队伍
async function handleDisband() {
  showConfirmDialog({
    title: '确认解散',
    message: '解散后无法恢复，确定要解散队伍吗？',
  }).then(async () => {
    try {
      await disbandTeam(team.value!.id)
      showToast('已解散')
      router.back()
    } catch (error) {
      showToast('操作失败')
    }
  }).catch(() => {})
}

// 团队打卡
async function handleCheckin() {
  try {
    const position = await new Promise<{ latitude: number; longitude: number }>((resolve) => {
      resolve({ latitude: 39.9163, longitude: 116.3972 })
    })

    await teamCheckin(team.value!.id, position)
    showToast({ type: 'success', message: '打卡成功' })
  } catch (error) {
    showToast('打卡失败')
  }
}

// 格式化时间
function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  loadTeam()
})
</script>

<template>
  <div class="team-detail-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="team?.name || '队伍详情'"
      left-arrow
      @click-left="router.back()"
    />

    <template v-if="team">
      <!-- 博物馆封面 -->
      <van-image :src="team.museumCover" width="100%" height="200" fit="cover" />

      <!-- 基本信息 -->
      <div class="info-card">
        <h1 class="team-name">{{ team.name }}</h1>
        <div class="team-meta">
          <span><van-icon name="location-o" /> {{ team.museumName }}</span>
          <span><van-icon name="clock-o" /> {{ formatTime(team.scheduledAt) }}</span>
        </div>
        <p class="team-desc" v-if="team.description">{{ team.description }}</p>
      </div>

      <!-- 成员列表 -->
      <div class="member-section">
        <div class="section-title">队伍成员 ({{ team.currentMembers }}/{{ team.maxMembers }})</div>
        <div class="member-list">
          <div v-for="member in team.members" :key="member.id" class="member-item">
            <van-image
              :src="member.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
              width="40"
              height="40"
              round
              fit="cover"
            />
            <div class="member-info">
              <div class="member-name">
                {{ member.nickname }}
                <van-tag v-if="member.userId === team.leaderId" type="warning" size="small">队长</van-tag>
              </div>
              <div class="member-joined">{{ formatTime(member.joinedAt) }} 加入</div>
            </div>
            <van-button
              v-if="isLeader && member.userId !== team.leaderId"
              size="small"
              type="danger"
              plain
              round
              @click="handleKick(member.userId)"
            >
              踢出
            </van-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <van-button
          v-if="!isJoined && team.status === 'recruiting'"
          type="primary"
          block
          round
          @click="handleJoin"
        >
          加入队伍
        </van-button>
        <van-button
          v-if="isJoined && !isLeader"
          type="danger"
          block
          round
          plain
          @click="handleLeave"
        >
          退出队伍
        </van-button>
        <van-button
          v-if="isLeader && team.status === 'recruiting'"
          type="danger"
          block
          round
          plain
          @click="handleDisband"
        >
          解散队伍
        </van-button>
        <van-button
          v-if="isJoined && team.status === 'active'"
          type="primary"
          block
          round
          @click="handleCheckin"
        >
          团队打卡
        </van-button>
      </div>
    </template>

    <van-empty v-else-if="!loading" description="队伍不存在" />
  </div>
</template>

<style lang="scss" scoped>
.team-detail-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  padding-bottom: 100px;
}

.info-card {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;

  .team-name {
    font-size: 20px;
    font-weight: 600;
    color: #2c2c2e;
    margin-bottom: 12px;
  }

  .team-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #8e8e93;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .team-desc {
    font-size: 14px;
    color: #646566;
    line-height: 1.6;
  }
}

.member-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c2c2e;
    margin-bottom: 12px;
  }

  .member-list {
    .member-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f7;

      &:last-child {
        border-bottom: none;
      }

      .member-info {
        flex: 1;

        .member-name {
          font-size: 14px;
          font-weight: 500;
          color: #2c2c2e;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .member-joined {
          font-size: 12px;
          color: #8e8e93;
          margin-top: 4px;
        }
      }
    }
  }
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
</style>
