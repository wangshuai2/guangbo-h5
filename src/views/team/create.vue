<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showLoadingToast, closeToast, showToast, showSuccessToast } from 'vant'
import { getMuseumList } from '@/api/museum'
import { createTeam } from '@/api/team'
import type { Museum } from '@/types'

const router = useRouter()

const museums = ref<Museum[]>([])
const loading = ref(false)
const submitting = ref(false)
const showMuseumPicker = ref(false)

const selectedMuseum = ref<Museum | null>(null)
const teamName = ref('')
const description = ref('')
const maxMembers = ref(5)
const scheduledDate = ref('')
const scheduledTime = ref('10:00')

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
  if (!teamName.value.trim()) {
    showToast('请输入队伍名称')
    return
  }
  if (!scheduledDate.value) {
    showToast('请选择日期')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '创建中...', forbidClick: true, duration: 0 })

  try {
    const scheduledAt = new Date(`${scheduledDate.value}T${scheduledTime.value}`).toISOString()
    
    const res = await createTeam({
      museumId: selectedMuseum.value.id,
      name: teamName.value,
      description: description.value,
      maxMembers: maxMembers.value,
      scheduledAt,
    })

    if (res.code === 0) {
      showSuccessToast('创建成功')
      router.replace('/team')
    } else {
      showToast(res.message || '创建失败')
    }
  } catch (error) {
    showToast('创建失败')
  } finally {
    submitting.value = false
    closeToast()
  }
}

onMounted(() => {
  loadMuseums()
  // 默认明天
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  scheduledDate.value = tomorrow.toISOString().split('T')[0]
})
</script>

<template>
  <div class="team-create-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="创建队伍"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <van-button type="primary" size="small" round @click="onSubmit" :loading="submitting">
          创建
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

      <!-- 队伍名称 -->
      <div class="form-section">
        <van-field
          v-model="teamName"
          label="队伍名称"
          placeholder="给队伍起个名字"
          maxlength="20"
          show-word-limit
        />
      </div>

      <!-- 队伍简介 -->
      <div class="form-section">
        <van-field
          v-model="description"
          label="队伍简介"
          type="textarea"
          placeholder="介绍一下这次参观计划..."
          rows="3"
          autosize
          maxlength="200"
          show-word-limit
        />
      </div>

      <!-- 人数限制 -->
      <div class="form-section">
        <van-field label="人数上限">
          <template #input>
            <van-stepper v-model="maxMembers" min="2" max="20" />
          </template>
        </van-field>
      </div>

      <!-- 计划时间 -->
      <div class="form-section">
        <van-cell title="计划日期" :value="scheduledDate" is-link @click="$refs.datePickerRef?.show()" />
        <van-cell title="计划时间" :value="scheduledTime" is-link @click="$refs.timePickerRef?.show()" />
      </div>
    </div>

    <!-- 博物馆选择弹窗 -->
    <van-popup v-model:show="showMuseumPicker" position="bottom" round style="height: 60vh">
      <div class="museum-picker">
        <van-nav-bar title="选择博物馆" left-arrow @click-left="showMuseumPicker = false" />
        <van-loading v-if="loading" size="24px" class="loading">加载中...</van-loading>
        <div class="museum-list" v-else>
          <div
            v-for="museum in museums"
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
            </div>
            <van-icon v-if="selectedMuseum?.id === museum.id" name="success" color="#8b5a2b" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.team-create-page {
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
    }
  }
}
</style>
