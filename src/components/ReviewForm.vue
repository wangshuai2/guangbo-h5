<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import RatingStars from './RatingStars.vue'

interface Props {
  museumId: number
  museumName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: { score: number; content: string; images: string[] }]
  cancel: []
}>()

const score = ref(0)
const content = ref('')
const images = ref<string[]>([])
const submitting = ref(false)

const isValid = computed(() => {
  return score.value > 0 && content.value.trim().length >= 10
})

const contentLength = computed(() => {
  return content.value.length
})

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files) return

  // 限制最多 3 张图片
  if (images.value.length + files.length > 3) {
    showToast('最多上传 3 张图片')
    return
  }

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast('请上传图片文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过 5MB')
      return
    }

    // 转换为 base64 预览
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        images.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })

  // 清空 input
  target.value = ''
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

async function handleSubmit() {
  if (score.value === 0) {
    showToast('请选择评分')
    return
  }

  if (content.value.trim().length < 10) {
    showToast('评论内容至少 10 个字')
    return
  }

  submitting.value = true

  try {
    emit('submit', {
      score: score.value,
      content: content.value.trim(),
      images: images.value
    })

    // 重置表单
    score.value = 0
    content.value = ''
    images.value = []
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="review-form">
    <div class="form-header">
      <h3>评价 {{ museumName }}</h3>
    </div>

    <div class="form-body">
      <!-- 评分 -->
      <div class="form-item">
        <label class="form-label">总体评分</label>
        <div class="rating-wrapper">
          <RatingStars v-model="score" size="large" />
          <span class="rating-hint" v-if="score === 0">点击星星评分</span>
          <span class="rating-hint" v-else>{{ score }} 分 - {{ ['非常差', '差', '一般', '好', '非常好'][score - 1] }}</span>
        </div>
      </div>

      <!-- 评论内容 -->
      <div class="form-item">
        <label class="form-label">评价内容</label>
        <van-field
          v-model="content"
          type="textarea"
          rows="4"
          placeholder="分享你的参观体验，帮助其他用户了解这个博物馆..."
          maxlength="500"
          show-word-limit
        />
        <div class="char-count">{{ contentLength }}/500</div>
      </div>

      <!-- 图片上传 -->
      <div class="form-item">
        <label class="form-label">上传图片（可选）</label>
        <div class="image-uploader">
          <div v-for="(image, index) in images" :key="index" class="image-preview">
            <van-image :src="image" width="80" height="80" fit="cover" radius="4" />
            <div class="remove-btn" @click="removeImage(index)">
              <van-icon name="close" />
            </div>
          </div>

          <div v-if="images.length < 3" class="upload-btn" @click="($refs.fileInput as HTMLInputElement).click()">
            <van-icon name="photograph" size="24" />
            <span>{{ images.length }}/3</span>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleImageUpload"
          />
        </div>
      </div>
    </div>

    <div class="form-footer">
      <van-button block round @click="handleCancel">取消</van-button>
      <van-button
        block
        round
        type="primary"
        :disabled="!isValid"
        :loading="submitting"
        @click="handleSubmit"
      >
        提交评价
      </van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-form {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.form-header {
  margin-bottom: 20px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
  }
}

.form-body {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-hint {
  font-size: 14px;
  color: #969799;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.image-uploader {
  display: flex;
  gap: 12px;
}

.image-preview {
  position: relative;

  .remove-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ff4d4f;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #969799;
  cursor: pointer;

  span {
    font-size: 12px;
    margin-top: 4px;
  }
}

.form-footer {
  display: flex;
  gap: 12px;

  .van-button {
    flex: 1;
  }
}
</style>
