<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import type { Team } from '@/api/team-checkin'

const router = useRouter()

const activeTab = ref('create')
const teamCode = ref('')

// 创建组队表单
const createForm = ref({
  name: '',
  maxMembers: 5
})

// 当前组队信息
const currentTeam = ref<Team | null>(null)

// 创建组队
async function handleCreateTeam() {
  if (!createForm.value.name.trim()) {
    showToast('请输入队伍名称')
    return
  }

  try {
    showToast('组队创建成功')
    activeTab.value = 'manage'
  } catch (error) {
    showToast('创建失败')
  }
}

// 加入组队
async function handleJoinTeam() {
  if (!teamCode.value.trim()) {
    showToast('请输入队伍码')
    return
  }

  try {
    showToast('加入成功')
    activeTab.value = 'manage'
  } catch (error) {
    showToast('加入失败')
  }
}

// 组队打卡
async function handleTeamCheckin() {
  showToast('组队打卡成功')
}

// 解散组队
async function handleDissolveTeam() {
  try {
    await showDialog({
      title: '确认解散',
      message: '解散后所有成员将无法继续组队打卡',
      showCancelButton: true
    })
    
    currentTeam.value = null
    showToast('已解散')
  } catch {
    // 取消
  }
}

// 复制队伍码
function copyTeamCode() {
  if (!currentTeam.value) return
  showToast(`队伍码: ${currentTeam.value.code}`)
}

onMounted(() => {
  // TODO: 获取当前组队信息
})
</script>

<template>
  <div class="team-page">
    <van-nav-bar
      title="组队打卡"
      left-arrow
      @click-left="router.back()"
    />

    <div class="page-content">
      <van-tabs v-model="activeTab" class="team-tabs">
        <van-tab title="创建队伍" name="create">
          <div class="tab-content">
            <div class="form-section">
              <div class="form-item">
                <div class="form-label">队伍名称</div>
                <van-field
                  v-model="createForm.name"
                  placeholder="请输入队伍名称"
                  maxlength="20"
                />
              </div>
              
              <div class="form-item">
                <div class="form-label">人数上限</div>
                <van-stepper v-model="createForm.maxMembers" min="2" max="10" />
              </div>
            </div>

            <van-button
              block
              round
              type="primary"
              size="large"
              @click="handleCreateTeam"
            >
              创建队伍
            </van-button>
          </div>
        </van-tab>

        <van-tab title="加入队伍" name="join">
          <div class="tab-content">
            <div class="join-section">
              <div class="join-title">输入队伍码加入</div>
              <van-field
                v-model="teamCode"
                placeholder="请输入6位队伍码"
                maxlength="6"
                class="code-input"
              />
              
              <van-button
                block
                round
                type="primary"
                size="large"
                @click="handleJoinTeam"
              >
                加入队伍
              </van-button>
            </div>
          </div>
        </van-tab>

        <van-tab title="我的队伍" name="manage">
          <div class="tab-content">
            <div v-if="!currentTeam" class="empty-team">
              <van-empty description="暂无队伍">
                <van-button type="primary" @click="activeTab = 'create'">
                  创建队伍
                </van-button>
              </van-empty>
            </div>

            <div v-else class="team-info">
              <div class="team-header">
                <div class="team-name">{{ currentTeam.name }}</div>
                <div class="team-code" @click="copyTeamCode">
                  队伍码: {{ currentTeam.code }}
                  <van-icon name="copy" />
                </div>
              </div>

              <div class="team-actions">
                <van-button
                  block
                  round
                  type="primary"
                  size="large"
                  @click="handleTeamCheckin"
                >
                  组队打卡
                </van-button>
                <van-button
                  block
                  round
                  type="danger"
                  plain
                  @click="handleDissolveTeam"
                >
                  解散队伍
                </van-button>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.team-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 12px;
}

.team-tabs {
  background-color: #fff;
  border-radius: 12px;
}

.tab-content {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 8px;
}

.join-section {
  text-align: center;
}

.join-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 20px;
}

.code-input {
  margin-bottom: 20px;
}

.empty-team {
  padding: 40px 0;
}

.team-info {
  padding: 16px;
}

.team-header {
  text-align: center;
  margin-bottom: 20px;
}

.team-name {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.team-code {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f7f8fa;
  border-radius: 20px;
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
}

.team-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
