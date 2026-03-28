<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  museumName: string
  address: string
  latitude: number
  longitude: number
  distance?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  navigate: [type: 'amap' | 'bmap' | 'qqmap']
}>()

// 格式化距离
const formattedDistance = computed(() => {
  if (!props.distance) return ''
  if (props.distance < 1000) {
    return `${Math.round(props.distance)}m`
  }
  return `${(props.distance / 1000).toFixed(1)}km`
})

// 导航选项
const navigationOptions = [
  {
    type: 'amap' as const,
    name: '高德地图',
    icon: 'https://pic.rmb.bdstatic.com/baidu-rmb-video-cover-1/2022-09/1663226331477/3d3d9e47a8b0f656e1c4c5c3e6e8f9a0.png',
    color: '#3c8cff'
  },
  {
    type: 'bmap' as const,
    name: '百度地图',
    icon: 'https://pic.rmb.bdstatic.com/baidu-rmb-video-cover-1/2022-09/1663226331477/3d3d9e47a8b0f656e1c4c5c3e6e8f9a0.png',
    color: '#4c90f9'
  },
  {
    type: 'qqmap' as const,
    name: '腾讯地图',
    icon: 'https://pic.rmb.bdstatic.com/baidu-rmb-video-cover-1/2022-09/1663226331477/3d3d9e47a8b0f656e1c4c5c3e6e8f9a0.png',
    color: '#00a4ff'
  }
]

function handleNavigate(type: 'amap' | 'bmap' | 'qqmap') {
  emit('navigate', type)
}

// 生成导航链接
function getNavigationUrl(type: 'amap' | 'bmap' | 'qqmap'): string {
  const { latitude, longitude, museumName, address } = props

  switch (type) {
    case 'amap':
      // 高德地图
      return `https://uri.amap.com/navigation?to=${longitude},${latitude},${encodeURIComponent(museumName)}&mode=car&policy=1`
    case 'bmap':
      // 百度地图
      return `https://api.map.baidu.com/marker?location=${latitude},${longitude}&title=${encodeURIComponent(museumName)}&content=${encodeURIComponent(address)}&output=html`
    case 'qqmap':
      // 腾讯地图
      return `https://apis.map.qq.com/tools/poimarker?type=0&marker=coord:${latitude},${longitude};title:${encodeURIComponent(museumName)};addr:${encodeURIComponent(address)}&referer=myapp`
    default:
      return ''
  }
}
</script>

<template>
  <div class="navigation-card">
    <div class="location-info">
      <div class="museum-name">{{ museumName }}</div>
      <div class="address">
        <van-icon name="location-o" />
        <span>{{ address }}</span>
      </div>
      <div v-if="distance" class="distance">
        <van-icon name="guide-o" />
        <span>距离您 {{ formattedDistance }}</span>
      </div>
    </div>

    <div class="navigation-options">
      <div
        v-for="option in navigationOptions"
        :key="option.type"
        class="nav-option"
        @click="handleNavigate(option.type)"
      >
        <div class="nav-icon" :style="{ backgroundColor: option.color + '20' }">
          <van-icon name="guide-o" :color="option.color" size="28" />
        </div>
        <div class="nav-name">{{ option.name }}</div>
      </div>
    </div>

    <div class="navigation-tips">
      <van-icon name="info-o" />
      <span>点击上方地图应用即可导航到博物馆</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.location-info {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebedf0;

  .museum-name {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 8px;
  }

  .address {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 14px;
    color: #646566;
    margin-bottom: 8px;

    .van-icon {
      color: #1989fa;
      margin-top: 2px;
    }
  }

  .distance {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #ff976a;

    .van-icon {
      color: #ff976a;
    }
  }
}

.navigation-options {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.nav-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f7f8fa;
  }

  .nav-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-name {
    font-size: 14px;
    color: #323233;
  }
}

.navigation-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  font-size: 12px;
  color: #969799;

  .van-icon {
    color: #1989fa;
  }
}
</style>
