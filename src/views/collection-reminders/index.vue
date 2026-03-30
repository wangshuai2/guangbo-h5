<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showConfirmDialog } from 'vant'
import { getCollectionReminders, deleteCollectionReminder, toggleCollectionReminder } from '@/api/collection-reminders'
import { useUserStore } from '@/stores/user'
import type { CollectionReminder } from '@/api/collection-reminders'

const router = useRouter()
const userStore = useUserStore()
const reminders = ref<CollectionReminder[]>([])
const loading = ref(true)

async function load() {
  try {
    const res = await getCollectionReminders()
    if (res.code === 0) reminders.value = res.data?.list || []
  } catch { showToast('加载失败') }
  finally { loading.value = false; closeToast() }
}

async function toggle(r: CollectionReminder) {
  try {
    await toggleCollectionReminder(r.id, !r.enabled)
    r.enabled = !r.enabled
    showToast(r.enabled ? '已开启' : '已关闭')
  } catch { showToast('操作失败') }
}

async function del(r: CollectionReminder) {
  showConfirmDialog({ title: '确认删除', message: '确定要删除这个提醒吗？' })
    .then(async () => {
      await deleteCollectionReminder(r.id)
      reminders.value = reminders.value.filter(x => x.id !== r.id)
      showToast('已删除')
    }).catch(() => {})
}

function add() { router.push('/collection-reminders/create') }

onMounted(() => {
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  load()
})
</script>

<template>
  <div class="reminders-page">
    <van-nav-bar title="收藏提醒">
      <template #right><van-icon name="plus" size="20" @click="add" /></template>
    </van-nav-bar>
    <div class="tip"><van-icon name="info-o" /> 开启后将在相关活动时收到通知</div>
    <div class="list" v-if="!loading">
      <div v-for="r in reminders" :key="r.id" class="card">
        <van-image :src="r.museumCover" width="50" height="50" radius="8" fit="cover" />
        <div class="info">
          <div class="name">{{ r.museumName }}</div>
          <div class="type">{{ r.type === 'exhibit_open' ? '展品开放提醒' : r.type === 'special_event' ? '特殊活动提醒' : '新展品提醒' }}</div>
        </div>
        <van-switch :model-value="r.enabled" size="20" @click="toggle(r)" />
        <van-icon name="delete-o" color="#ff3b30" size="18" @click="del(r)" />
      </div>
      <van-empty v-if="!reminders.length" description="还没有设置提醒">
        <van-button type="primary" round @click="add">添加提醒</van-button>
      </van-empty>
    </div>
    <div class="fab" @click="add"><van-icon name="plus" size="24" /></div>
  </div>
</template>

<style scoped>
.reminders-page { min-height: 100vh; background: #f5f5f7; padding-bottom: 80px }
.tip { display: flex; align-items: center; gap: 6px; padding: 12px; background: linear-gradient(135deg, rgba(139,90,43,.1), rgba(212,165,116,.1)); color: #8b5a2b; font-size: 13px }
.list { padding: 12px }
.card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fff; border-radius: 12px; margin-bottom: 12px }
.info { flex: 1 }
.name { font-size: 15px; font-weight: 500; color: #2c2c2e }
.type { font-size: 12px; color: #8e8e93; margin-top: 4px }
.fab { position: fixed; right: 16px; bottom: 80px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #8b5a2b, #d4a574); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(139,90,43,.4) }
</style>
