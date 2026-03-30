<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showSuccessToast } from 'vant'
import { getMuseumList } from '@/api/museum'
import { createReminder } from '@/api/reminders'
import type { Museum } from '@/types'

const router = useRouter()

const museums = ref<Museum[]>([])
const loading = ref(false)
const submitting = ref(false)
const showMuseumPicker = ref(false)
const searchKeyword = ref('')

const selectedMuseum = ref<Museum | null>(null)
const reminderType = ref<'open' | 'close'>('open')
const advanceMinutes = ref(30)

// 预设的提前时间选项
const advanceOptions = [
  { label: '15分钟前', value: 15 },
  { label: '30分钟前', value: 30 },
  { label: '1小时前', value: 60 },
  { label: '2小时前', value: 120 },
  { label: '1天前', value: 1440 },
]

// 加载博物馆列表
async function loadMuseums() {
  loading.value = true
  try {
    const res = await getMuseumList({ pageSize: 100 })
    if (res.code === 0 && res.data) {
      museums.value = res.data.list
    }
  } catch (error) {
    showToast('加载博物馆失败')
  } finally {
    loading.value = false
  }
}

// 筛选博物馆
const filteredMuseums = ref<Museum[]>([])
function filterMuseums() {
  if (!searchKeyword.value) {
    filteredMuseums.value = museums.value
  } else {
    filteredMuseums.value = museums.value.filter(m => 
      m.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
}

// 选择博物馆
function selectMuseum(museum: Museum) {
  selectedMuseum.value = museum
  showMuseumPicker.value = false
}

// 提交
async function onSubmit() {
  if (!selectedMuseum.value) {
    showToast('请选择博物馆')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 })

  try {
    const res = await createReminder({
      museumId: selectedMuseum.value.id,
      type: reminderType.value,
      advanceMinutes: advanceMinutes.value,
    })

    if (res.code === 0) {
      showSuccessToast('设置成功')
      router.back()
    } else {
      showToast(res.message || '设置失败')
    }
  } catch (error) {
    showToast('设置失败')
  } finally {
    submitting.value = false
    closeToast()
  }
}

onMounted(() => {
  loadMuseums()
})
</script>

<template>
  <div class="reminder-create-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="添加提醒"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <van-button type="primary" size="small" round @click="onSubmit" :loading="submitting">
          保存
        </van-button>
      </template>
    </van-nav-bar>

    <div class="form-content">
      <!-- 选择博物馆 -->
      <div class="form-section">
        <div class="section-label">选择博物馆</div>
        <div class="museum-select" @click="showMuseumPicker = true">
          <template v-if="selectedMuseum">
            <van-image
              :src="selectedMuseum.coverImage"
              width="48"
              height="48"
              fit="cover"
              radius="8"
            />
            <div class="museum-info">
              <div class="museum-name">{{ selectedMuseum.name }}</div>
              <div class="museum-address">{{ selectedMuseum.province }} · {{ selectedMuseum.city }}</div>
            </div>
          </template>
          <template v-else>
            <van-icon name="location-o" size="24" color="#8b5a2b" />
            <span class="placeholder">点击选择博物馆</span>
          </template>
          <van-icon name="arrow" color="#c7c7cc" />
        </div>
      </div>

      <!-- 提醒类型 -->
      <div class="form-section">
        <div class="section-label">提醒类型</div>
        <van-radio-group v-model="reminderType">
          <van-cell-group inset>
            <van-cell title="开馆提醒" clickable @click="reminderType = 'open'">
              <template #right-icon>
                <van-radio name="open" />
              </template>
            </van-cell>
            <van-cell title="闭馆提醒" clickable @click="reminderType = 'close'">
              <template #right-icon>
                <van-radio name="close" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
        <div class="section-tip">
          {{ reminderType === 'open' ? '将在博物馆开馆前提醒您' : '将在博物馆闭馆前提醒您' }}
        </div>
      </div>

      <!-- 提前时间 -->
      <div class="form-section">
        <div class="section-label">提前时间</div>
        <van-radio-group v-model="advanceMinutes">
          <van-cell-group inset>
            <van-cell
              v-for="opt in advanceOptions"
              :key="opt.value"
              :title="opt.label"
              clickable
              @click="advanceMinutes = opt.value"
            >
              <template #right-icon>
                <van-radio :name="opt.value" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
    </div>

    <!-- 博物馆选择弹窗 -->
    <van-popup v-model:show="showMuseumPicker" position="bottom" round style="height: 70vh">
      <div class="museum-picker">
        <van-nav-bar title="选择博物馆" left-arrow @click-left="showMuseumPicker = false" />
        <van-search
          v-model="searchKeyword"
          placeholder="搜索博物馆"
          @update:model-value="filterMuseums"
        />
        <van-loading v-if="loading" size="24px" class="loading">加载中...</van-loading>
        <div class="museum-list" v-else>
          <div
            v-for="museum in (searchKeyword ? filteredMuseums : museums)"
            :key="museum.id"
            class="museum-item"
            :class="{ selected: selectedMuseum?.id === museum.id }"
            @click="selectMuseum(museum)"
          >
            <van-image
              :src="museum.coverImage"
              width="56"
              height="56"
              fit="cover"
              radius="8"
            />
            <div class="museum-info">
              <div class="museum-name">{{ museum.name }}</div>
              <div class="museum-address">{{ museum.province }} · {{ museum.city }}</div>
              <div class="museum-time">
                <van-icon name="clock-o" size="12" />
                {{ museum.openTime || '09:00' }} - {{ museum.closeTime || '17:00' }}
              </div>
            </div>
            <van-icon v-if="selectedMuseum?.id === museum.id" name="success" color="#8b5a2b" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.reminder-create-page {
  min-height: 100vh;
  background-color: #f5f5f7;
}

.form-content {
  padding: 12px;
}

.form-section {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;

  .section-label {
    padding: 16px 16px 8px;
    font-size: 14px;
    font-weight: 500;
    color: #646566;
  }

  .section-tip {
    padding: 0 16px 12px;
    font-size: 12px;
    color: #8e8e93;
  }
}

.museum-select {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;

  .museum-info {
    flex: 1;

    .museum-name {
      font-size: 15px;
      font-weight: 500;
      color: #2c2c2e;
    }

    .museum-address {
      font-size: 12px;
      color: #8e8e93;
      margin-top: 4px;
    }
  }

  .placeholder {
    flex: 1;
    font-size: 15px;
    color: #c7c7cc;
  }
}

.museum-picker {
  height: 100%;
  display: flex;
  flex-direction: column;

  .loading {
    padding: 40px;
    text-align: center;
  }

  .museum-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px 12px;
  }

  .museum-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 8px;
    background: #f5f5f7;
    cursor: pointer;

    &.selected {
      background: rgba(139, 90, 43, 0.1);
    }

    .museum-info {
      flex: 1;

      .museum-name {
        font-size: 15px;
        font-weight: 500;
        color: #2c2c2e;
      }

      .museum-address {
        font-size: 12px;
        color: #8e8e93;
        margin-top: 4px;
      }

      .museum-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #8b5a2b;
        margin-top: 4px;
      }
    }
  }
}
</style>
