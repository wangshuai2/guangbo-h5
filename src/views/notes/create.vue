<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { createNote, updateNote, getNoteDetail, uploadNoteImage } from '@/api/notes'
import { getMuseumList } from '@/api/museum'
import type { Museum } from '@/types'

const router = useRouter()
const route = useRoute()

const noteId = ref<number | null>(null)
const title = ref('')
const content = ref('')
const images = ref<string[]>([])
const visitDate = ref('')
const isPublic = ref(false)
const selectedMuseum = ref<Museum | null>(null)
const showMuseumPicker = ref(false)
const showDatePicker = ref(false)
const submitting = ref(false)
const museums = ref<Museum[]>([])
const museumLoading = ref(false)

// 是否编辑模式
const isEdit = ref(false)

// 日期范围
const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

// 加载博物馆列表
async function loadMuseums() {
  museumLoading.value = true
  try {
    const res = await getMuseumList({ pageSize: 100 })
    if (res.code === 0 && res.data) {
      museums.value = res.data.list
    }
  } catch (error) {
    console.error('加载博物馆失败', error)
  } finally {
    museumLoading.value = false
  }
}

// 加载笔记详情（编辑模式）
async function loadNote() {
  if (!noteId.value) return

  try {
    showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
    const res = await getNoteDetail(noteId.value)
    if (res.code === 0 && res.data) {
      title.value = res.data.title
      content.value = res.data.content
      images.value = res.data.images || []
      visitDate.value = res.data.visitDate
      isPublic.value = res.data.isPublic
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    closeToast()
  }
}

// 选择博物馆
function onSelectMuseum(museum: Museum) {
  selectedMuseum.value = museum
  showMuseumPicker.value = false
}

// 选择日期
function onConfirmDate(value: Date) {
  visitDate.value = value.toISOString().split('T')[0]
  showDatePicker.value = false
}

// 上传图片
async function afterRead(file: any) {
  file.status = 'uploading'
  file.message = '上传中...'

  try {
    const res = await uploadNoteImage(file.file)
    if (res.code === 0 && res.data) {
      file.status = 'done'
      images.value.push(res.data.url)
    } else {
      file.status = 'failed'
      file.message = '上传失败'
    }
  } catch (error) {
    file.status = 'failed'
    file.message = '上传失败'
  }
}

// 删除图片
function deleteImage(index: number) {
  images.value.splice(index, 1)
}

// 提交笔记
async function onSubmit() {
  if (!title.value.trim()) {
    showToast('请输入标题')
    return
  }

  if (!content.value.trim()) {
    showToast('请输入内容')
    return
  }

  if (!selectedMuseum.value && !isEdit.value) {
    showToast('请选择博物馆')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 })

  try {
    const params = {
      title: title.value,
      content: content.value,
      images: images.value,
      visitDate: visitDate.value || new Date().toISOString().split('T')[0],
      isPublic: isPublic.value,
      museumId: selectedMuseum.value?.id || 0,
    }

    let res
    if (isEdit.value && noteId.value) {
      res = await updateNote({ id: noteId.value, ...params })
    } else {
      res = await createNote(params)
    }

    if (res.code === 0) {
      showToast({
        type: 'success',
        message: isEdit.value ? '修改成功' : '创建成功',
      })
      router.back()
    } else {
      showToast(res.message || '保存失败')
    }
  } catch (error) {
    showToast('保存失败')
  } finally {
    submitting.value = false
    closeToast()
  }
}

// 返回确认
function onBack() {
  if (title.value || content.value || images.value.length) {
    showConfirmDialog({
      title: '提示',
      message: '确定要放弃当前编辑吗？',
    }).then(() => {
      router.back()
    }).catch(() => {})
  } else {
    router.back()
  }
}

onMounted(() => {
  // 检查是否编辑模式
  const id = route.params.id
  if (id) {
    noteId.value = Number(id)
    isEdit.value = true
    loadNote()
  }

  loadMuseums()

  // 默认今天的日期
  if (!visitDate.value) {
    visitDate.value = new Date().toISOString().split('T')[0]
  }
})
</script>

<template>
  <div class="note-create-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="isEdit ? '编辑笔记' : '写笔记'"
      left-arrow
      @click-left="onBack"
    >
      <template #right>
        <van-button type="primary" size="small" round @click="onSubmit" :loading="submitting">
          发布
        </van-button>
      </template>
    </van-nav-bar>

    <div class="form-content">
      <!-- 选择博物馆 -->
      <div class="form-section" v-if="!isEdit">
        <div class="section-label">参观博物馆</div>
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
            <span class="placeholder">选择参观的博物馆</span>
          </template>
          <van-icon name="arrow" color="#c7c7cc" />
        </div>
      </div>

      <!-- 标题 -->
      <div class="form-section">
        <van-field
          v-model="title"
          placeholder="给你的笔记起个标题"
          maxlength="50"
          show-word-limit
          class="title-input"
        />
      </div>

      <!-- 内容 -->
      <div class="form-section">
        <van-field
          v-model="content"
          type="textarea"
          placeholder="记录你的参观感受、印象深刻的展品、有趣的发现..."
          rows="6"
          autosize
          maxlength="2000"
          show-word-limit
          class="content-input"
        />
      </div>

      <!-- 图片上传 -->
      <div class="form-section">
        <div class="section-label">添加图片</div>
        <van-uploader
          v-model="images as any"
          multiple
          :max-count="9"
          :after-read="afterRead"
          @delete="deleteImage"
        />
      </div>

      <!-- 参观日期 -->
      <div class="form-section">
        <van-cell title="参观日期" :value="visitDate" is-link @click="showDatePicker = true" />
      </div>

      <!-- 是否公开 -->
      <div class="form-section">
        <van-cell title="公开笔记">
          <template #right-icon>
            <van-switch v-model="isPublic" size="22" />
          </template>
        </van-cell>
        <div class="section-tip">公开后其他用户可以看到你的笔记</div>
      </div>
    </div>

    <!-- 博物馆选择弹窗 -->
    <van-popup v-model:show="showMuseumPicker" position="bottom" round style="height: 60vh">
      <div class="museum-picker">
        <van-nav-bar title="选择博物馆" left-arrow @click-left="showMuseumPicker = false" />
        <van-search placeholder="搜索博物馆" />
        <van-loading v-if="museumLoading" size="24px" class="loading">加载中...</van-loading>
        <div class="museum-list" v-else>
          <div
            v-for="museum in museums"
            :key="museum.id"
            class="museum-item"
            :class="{ selected: selectedMuseum?.id === museum.id }"
            @click="onSelectMuseum(museum)"
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

    <!-- 日期选择弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirmDate"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.note-create-page {
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

.title-input {
  font-size: 18px;
  font-weight: 500;

  :deep(.van-field__control) {
    font-size: 18px;
  }
}

.content-input {
  :deep(.van-field__control) {
    line-height: 1.8;
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
