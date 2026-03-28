<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getPosterData, createShare } from '@/api/poster'
import type { PosterData, PosterTemplateType } from '@/types/poster'

// Props
const props = defineProps<{
  visible: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
  shared: [channel: string]
}>()

// Computed visible for v-model
const isVisible = computed({
  get: () => props.visible,
  set: () => emit('close')
})

// State
const posterData = ref<PosterData | null>(null)
const loading = ref(false)
const generating = ref(false)
const currentTemplate = ref<PosterTemplateType>('simple')
const posterImage = ref<string>('')
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Templates
const templates: { type: PosterTemplateType; name: string; color: string }[] = [
  { type: 'simple', name: '简约风', color: '#ffffff' },
  { type: 'chinese', name: '中国风', color: '#f5e6d3' },
  { type: 'modern', name: '现代风', color: '#1a1a2e' }
]

// Computed
const posterWidth = 750
const posterHeight = 1334

// Load poster data
async function loadPosterData() {
  loading.value = true
  showLoadingToast({
    message: '加载数据...',
    forbidClick: true,
    duration: 0
  })

  try {
    const res = await getPosterData()
    if (res.code === 0 && res.data) {
      posterData.value = res.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// Generate poster
async function generatePoster() {
  if (!posterData.value || !canvasRef.value) return

  generating.value = true
  showLoadingToast({
    message: '生成海报...',
    forbidClick: true,
    duration: 0
  })

  try {
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = posterWidth
    canvas.height = posterHeight

    await drawPoster(ctx, posterData.value, currentTemplate.value)
    posterImage.value = canvas.toDataURL('image/png', 0.9)
  } catch (error) {
    showToast('生成失败')
  } finally {
    generating.value = false
    closeToast()
  }
}

// Draw poster on canvas
async function drawPoster(ctx: CanvasRenderingContext2D, data: PosterData, template: PosterTemplateType) {
  const config = templates.find(t => t.type === template)!

  // Background
  ctx.fillStyle = config.color
  ctx.fillRect(0, 0, posterWidth, posterHeight)

  // Header
  ctx.fillStyle = template === 'modern' ? '#ffffff' : '#333333'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('逛博', posterWidth / 2, 60)
  ctx.font = '24px sans-serif'
  ctx.fillText('探索博物馆，记录文化之旅', posterWidth / 2, 100)

  // User info
  const userY = 180
  ctx.font = 'bold 32px sans-serif'
  ctx.fillText(data.user.nickname, posterWidth / 2, userY)
  ctx.font = '20px sans-serif'
  ctx.fillText(`博物馆探索家 Lv.${data.user.level}`, posterWidth / 2, userY + 40)

  // Stats
  const statsY = 280
  ctx.fillStyle = template === 'modern' ? '#4a90d9' : '#1989fa'
  ctx.fillRect(50, statsY, posterWidth - 100, 120)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText('📊 我的足迹', posterWidth / 2, statsY + 30)

  ctx.font = '48px sans-serif'
  ctx.fillText(`${data.stats.totalMuseums}`, 200, statsY + 90)
  ctx.fillText(`${data.stats.totalProvinces}`, 400, statsY + 90)
  ctx.fillText(`${data.stats.totalCities}`, 600, statsY + 90)

  ctx.font = '16px sans-serif'
  ctx.fillText('打卡博物馆', 200, statsY + 115)
  ctx.fillText('解锁省份', 400, statsY + 115)
  ctx.fillText('解锁城市', 600, statsY + 115)

  // Medals
  const medalsY = 450
  ctx.fillStyle = template === 'modern' ? '#ffffff' : '#333333'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('🏆 解锁勋章', 50, medalsY)

  if (data.medals.length > 0) {
    data.medals.slice(0, 4).forEach((medal, i) => {
      ctx.fillStyle = '#ff976a'
      ctx.beginPath()
      ctx.arc(50 + i * 170 + 40, medalsY + 50, 30, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(medal.name, 50 + i * 170 + 40, medalsY + 95)
    })
  }

  // Recent museums
  const museumsY = 620
  ctx.fillStyle = template === 'modern' ? '#ffffff' : '#333333'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('📍 最近打卡', 50, museumsY)

  data.recentMuseums.slice(0, 3).forEach((museum, i) => {
    ctx.font = '18px sans-serif'
    ctx.fillText(`• ${museum.name} (${museum.city})`, 50, museumsY + 40 + i * 40)
  })

  // QR Code placeholder
  const qrY = posterHeight - 200
  ctx.fillStyle = template === 'modern' ? '#2d2d44' : '#f7f8fa'
  ctx.fillRect(posterWidth / 2 - 80, qrY, 160, 160)

  ctx.fillStyle = template === 'modern' ? '#ffffff' : '#666666'
  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('扫码下载APP', posterWidth / 2, qrY + 180)
}

// Save poster
async function savePoster() {
  if (!posterImage.value) {
    showToast('请先生成海报')
    return
  }

  try {
    const link = document.createElement('a')
    link.download = `逛博足迹海报_${Date.now()}.png`
    link.href = posterImage.value
    link.click()
    showToast('保存成功')
  } catch (error) {
    showToast('保存失败')
  }
}

// Share poster
async function sharePoster(channel: string) {
  if (!posterImage.value) {
    showToast('请先生成海报')
    return
  }

  try {
    await createShare({ type: 'poster', channel })
    showToast('分享成功')
    emit('shared', channel)
  } catch (error) {
    showToast('分享失败')
  }
}

// Close modal
function handleClose() {
  emit('close')
}

// Change template
function changeTemplate(type: PosterTemplateType) {
  currentTemplate.value = type
  if (posterData.value) {
    generatePoster()
  }
}

// Initialize
onMounted(() => {
  if (props.visible) {
    loadPosterData()
  }
})
</script>

<template>
  <van-popup v-model:show="isVisible" position="bottom" round style="height: 90vh" @close="handleClose">
    <div class="poster-generator">
      <van-nav-bar title="生成足迹海报" left-arrow @click-left="handleClose">
        <template #right>
          <van-button size="small" type="primary" @click="savePoster">保存</van-button>
        </template>
      </van-nav-bar>

      <div class="poster-content">
        <div class="template-selector">
          <span class="label">选择模板：</span>
          <van-radio-group v-model="currentTemplate" direction="horizontal">
            <van-radio v-for="t in templates" :key="t.type" :name="t.type">{{ t.name }}</van-radio>
          </van-radio-group>
        </div>

        <div class="poster-preview">
          <canvas ref="canvasRef" class="poster-canvas" :style="{ width: '100%', height: 'auto' }" />
          <img v-if="posterImage" :src="posterImage" class="poster-image" alt="足迹海报" />
          <van-loading v-if="generating" class="loading-overlay">生成中...</van-loading>
        </div>

        <van-button
          v-if="posterData && !posterImage"
          block
          type="primary"
          :loading="generating"
          @click="generatePoster"
        >
          生成海报
        </van-button>

        <div v-if="posterImage" class="share-buttons">
          <van-button type="success" @click="sharePoster('wechat_moments')">
            <van-icon name="wechat" />
            分享到朋友圈
          </van-button>
          <van-button type="default" @click="savePoster">
            <van-icon name="photo-o" />
            保存到相册
          </van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style lang="scss" scoped>
.poster-generator {
  height: 100%;
  background-color: #f7f8fa;
}

.poster-content {
  padding: 16px;
  overflow-y: auto;
}

.template-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 16px;

  .label {
    font-size: 14px;
    color: #646566;
  }
}

.poster-preview {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .poster-canvas {
    display: none;
  }

  .poster-image {
    width: 100%;
    border-radius: 8px;
  }

  .loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.share-buttons {
  display: flex;
  gap: 12px;

  .van-button {
    flex: 1;

    .van-icon {
      margin-right: 8px;
    }
  }
}
</style>