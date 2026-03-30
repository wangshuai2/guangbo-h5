<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showSuccessToast } from 'vant'
import { getMuseumList } from '@/api/museum'
import { createCollectionReminder } from '@/api/collection-reminders'
import type { Museum } from '@/types'

const router = useRouter()
const museums = ref<Museum[]>([])
const selected = ref<Museum | null>(null)
const type = ref('exhibit_open')
const showPicker = ref(false)
const submitting = ref(false)

async function loadMuseums() {
  try {
    const res = await getMuseumList({ pageSize: 100 })
    if (res.code === 0) museums.value = res.data?.list || []
  } catch { showToast('加载失败') }
}

function select(m: Museum) { selected.value = m; showPicker.value = false }

async function submit() {
  if (!selected.value) { showToast('请选择博物馆'); return }
  submitting.value = true
  showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 })
  try {
    const res = await createCollectionReminder({ museumId: selected.value.id, type: type.value })
    if (res.code === 0) { showSuccessToast('设置成功'); router.back() }
    else showToast(res.message || '设置失败')
  } catch { showToast('设置失败') }
  finally { submitting.value = false; closeToast() }
}

onMounted(() => loadMuseums())
</script>

<template>
  <div class="create-page">
    <van-nav-bar title="添加提醒" left-arrow @click-left="router.back()">
      <template #right><van-button type="primary" size="small" round @click="submit" :loading="submitting">保存</van-button></template>
    </van-nav-bar>
    <div class="form">
      <div class="section">
        <div class="label">选择博物馆</div>
        <div class="select" @click="showPicker = true">
          <template v-if="selected">
            <van-image :src="selected.coverImage" width="40" height="40" radius="6" fit="cover" />
            <span>{{ selected.name }}</span>
          </template>
          <template v-else><van-icon name="location-o" color="#8b5a2b" /><span class="placeholder">点击选择</span></template>
          <van-icon name="arrow" color="#c7c7cc" />
        </div>
      </div>
      <div class="section">
        <div class="label">提醒类型</div>
        <van-radio-group v-model="type">
          <van-cell-group inset>
            <van-cell title="展品开放提醒" clickable @click="type = 'exhibit_open'"><template #right-icon><van-radio name="exhibit_open" /></template></van-cell>
            <van-cell title="特殊活动提醒" clickable @click="type = 'special_event'"><template #right-icon><van-radio name="special_event" /></template></van-cell>
            <van-cell title="新展品提醒" clickable @click="type = 'new_exhibit'"><template #right-icon><van-radio name="new_exhibit" /></template></van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
    </div>
    <van-popup v-model:show="showPicker" position="bottom" round style="height: 60vh">
      <div class="picker">
        <van-nav-bar title="选择博物馆" left-arrow @click-left="showPicker = false" />
        <div class="ml">
          <div v-for="m in museums" :key="m.id" class="mi" :class="{ sel: selected?.id === m.id }" @click="select(m)">
            <van-image :src="m.coverImage" width="48" height="48" radius="6" fit="cover" />
            <div class="mi-info"><div class="mi-name">{{ m.name }}</div><div class="mi-addr">{{ m.province }} · {{ m.city }}</div></div>
            <van-icon v-if="selected?.id === m.id" name="success" color="#8b5a2b" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.create-page { min-height: 100vh; background: #f5f5f7 }
.form { padding: 12px }
.section { background: #fff; border-radius: 12px; margin-bottom: 12px; overflow: hidden }
.label { padding: 12px 16px 8px; font-size: 14px; color: #646566 }
.select { display: flex; align-items: center; gap: 12px; padding: 12px 16px }
.select span { flex: 1 }
.placeholder { color: #c7c7cc }
.picker { height: 100%; display: flex; flex-direction: column }
.ml { flex: 1; overflow-y: auto; padding: 12px }
.mi { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f5f5f7; border-radius: 12px; margin-bottom: 8px }
.mi.sel { background: rgba(139,90,43,.1) }
.mi-info { flex: 1 }
.mi-name { font-size: 14px; font-weight: 500; color: #2c2c2e }
.mi-addr { font-size: 12px; color: #8e8e93; margin-top: 2px }
</style>
