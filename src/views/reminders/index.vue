<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import { getReminderList, deleteReminder, toggleReminder } from '@/api/reminders'
import { useUserStore } from '@/stores/user'
import type { Reminder } from '@/api/reminders'

const router = useRouter()
const userStore = useUserStore()

const reminders = ref<Reminder[]>([])
const loading = ref(true)

// 按博物馆分组
const groupedReminders = computed(() => {
  const groups: Record<number, { museum: { id: number; name: string; cover: string }; reminders: Reminder[] }> = {}
  
  reminders.value.forEach(r => {
    if (!groups[r.museumId]) {
      groups[r.museumId] = {
        museum: { id: r.museumId, name: r.museumName, cover: r.museumCover },
        reminders: []
      }
    }
    groups[r.museumId].reminders.push(r)
  })
  
  return Object.values(groups)
})

// 加载提醒列表
async function loadReminders() {
  try {
    const res = await getReminderList()
    if (res.code === 0 && res.data) {
      reminders.value = res.data.list || []
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 添加提醒
function addReminder() {
  router.push('/reminders/create')
}

// 编辑提醒
function editReminder(id: number) {
  router.push(`/reminders/${id}/edit`)
}

// 删除提醒
async function handleDelete(id: number) {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除这个提醒吗？',
  }).then(async () => {
    try {
      await deleteReminder(id)
      showToast('删除成功')
      reminders.value = reminders.value.filter(r => r.id !== id)
    } catch (error) {
      showToast('删除失败')
    }
  }).catch(() => {})
}

// 切换开关
async function handleToggle(r: Reminder) {
  try {
    await toggleReminder(r.id, !r.enabled)
    r.enabled = !r.enabled
    showToast(r.enabled ? '已开启' : '已关闭')
  } catch (error) {
    showToast('操作失败')
  }
}

// 提醒类型文字
function getTypeText(type: string) {
  return type === 'open' ? '开馆提醒' : '闭馆提醒'
}

// 提前时间文字
function getAdvanceText(minutes: number) {
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}小时前`
  }
  return `${hours}小时${mins}分钟前`
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  loadReminders()
})
</script>

<template>
  <div class="reminders-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="开放时间提醒">
      <template #right>
        <van-icon name="plus" size="20" @click="addReminder" />
      </template>
    </van-nav-bar>

    <!-- 提示信息 -->
    <div class="tip-banner">
      <van-icon name="info-o" size="16" />
      <span>设置提醒后，将在开馆/闭馆前收到通知</span>
    </div>

    <!-- 提醒列表 -->
    <div class="reminder-content" v-if="!loading">
      <template v-if="groupedReminders.length > 0">
        <div v-for="group in groupedReminders" :key="group.museum.id" class="museum-group">
          <!-- 博物馆标题 -->
          <div class="museum-header">
            <van-image :src="group.museum.cover" width="40" height="40" radius="8" fit="cover" />
            <span class="museum-name">{{ group.museum.name }}</span>
          </div>
          
          <!-- 提醒项 -->
          <div class="reminder-list">
            <div v-for="r in group.reminders" :key="r.id" class="reminder-item">
              <div class="reminder-info">
                <div class="reminder-type">{{ getTypeText(r.type) }}</div>
                <div class="reminder-time">{{ getAdvanceText(r.advanceMinutes) }}</div>
              </div>
              <div class="reminder-actions">
                <van-switch :model-value="r.enabled" size="20" @click="handleToggle(r)" />
                <van-icon name="edit" size="18" color="#646566" @click="editReminder(r.id)" />
                <van-icon name="delete-o" size="18" color="#ff3b30" @click="handleDelete(r.id)" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <van-empty v-else description="还没有设置提醒">
        <van-button type="primary" round @click="addReminder">添加提醒</van-button>
      </van-empty>
    </div>

    <!-- 浮动按钮 -->
    <div class="fab" @click="addReminder">
      <van-icon name="plus" size="24" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reminders-page {
  min-height: 100vh;
  background-color: #f5f5f7;
  padding-bottom: 80px;
}

.tip-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(139, 90, 43, 0.1), rgba(212, 165, 116, 0.1));
  color: #8b5a2b;
  font-size: 13px;
}

.reminder-content {
  padding: 12px;
}

.museum-group {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;

  .museum-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #f5f5f7;

    .museum-name {
      font-size: 15px;
      font-weight: 600;
      color: #2c2c2e;
    }
  }

  .reminder-list {
    .reminder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid #f5f5f7;

      &:last-child {
        border-bottom: none;
      }

      .reminder-info {
        .reminder-type {
          font-size: 14px;
          font-weight: 500;
          color: #2c2c2e;
        }

        .reminder-time {
          font-size: 12px;
          color: #8e8e93;
          margin-top: 4px;
        }
      }

      .reminder-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
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
