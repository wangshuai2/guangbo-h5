<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VisitRoute } from '@/api/visit-route'

interface Props {
  routes: VisitRoute[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [route: VisitRoute]
}>()

const selectedRouteId = ref<number | null>(null)

const selectedRoute = computed(() => {
  return props.routes.find(r => r.id === selectedRouteId.value)
})

const difficultyText = {
  easy: '轻松',
  medium: '适中',
  hard: '深度'
}

const difficultyColor = {
  easy: '#07c160',
  medium: '#ffc107',
  hard: '#ff976a'
}

function selectRoute(route: VisitRoute) {
  selectedRouteId.value = route.id
  emit('select', route)
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
  }
  return `${mins}分钟`
}
</script>

<template>
  <div class="visit-route">
    <div class="route-header">
      <div class="route-title">
        <van-icon name="guide-o" />
        <span>参观路线推荐</span>
      </div>
    </div>

    <!-- 路线列表 -->
    <div class="routes-list">
      <div
        v-for="route in routes"
        :key="route.id"
        class="route-card"
        :class="{ selected: selectedRouteId === route.id }"
        @click="selectRoute(route)"
      >
        <div class="route-info">
          <div class="route-name">{{ route.name }}</div>
          <div class="route-desc">{{ route.description }}</div>
          <div class="route-tags">
            <van-tag 
              :color="difficultyColor[route.difficulty]"
              class="difficulty-tag"
            >
              {{ difficultyText[route.difficulty] }}
            </van-tag>
            <van-tag 
              v-for="tag in route.tags" 
              :key="tag"
              type="primary"
              plain
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>
        <div class="route-duration">
          <van-icon name="clock-o" />
          <span>{{ formatDuration(route.duration) }}</span>
        </div>
      </div>
    </div>

    <!-- 选中路线详情 -->
    <div v-if="selectedRoute" class="route-detail">
      <div class="detail-header">
        <div class="detail-title">{{ selectedRoute.name }}</div>
        <div class="detail-subtitle">共 {{ selectedRoute.points.length }} 个参观点</div>
      </div>

      <div class="route-timeline">
        <div
          v-for="(point, index) in selectedRoute.points"
          :key="point.id"
          class="timeline-item"
        >
          <div class="timeline-marker">{{ index + 1 }}</div>
          <div class="timeline-content">
            <van-image
              :src="point.image"
              width="80"
              height="60"
              fit="cover"
              radius="4"
            />
            <div class="point-info">
              <div class="point-name">{{ point.name }}</div>
              <div class="point-desc">{{ point.description }}</div>
              <div class="point-duration">
                <van-icon name="clock-o" />
                建议停留 {{ point.duration }} 分钟
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.visit-route {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
}

.route-header {
  margin-bottom: 16px;
}

.route-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;

  .van-icon {
    color: #1989fa;
  }
}

.routes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.route-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  &:hover {
    background-color: #e8f4fd;
  }

  &.selected {
    border-color: #1989fa;
    background-color: #e8f4fd;
  }
}

.route-info {
  flex: 1;
}

.route-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.route-desc {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}

.route-tags {
  display: flex;
  gap: 8px;
}

.difficulty-tag {
  color: #fff;
}

.route-duration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: #fff;
  border-radius: 8px;
  font-size: 12px;
  color: #646566;

  .van-icon {
    color: #1989fa;
    font-size: 16px;
  }
}

.route-detail {
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

.detail-header {
  margin-bottom: 16px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.detail-subtitle {
  font-size: 14px;
  color: #969799;
}

.route-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 12px;
}

.timeline-marker {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #1989fa;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.timeline-content {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
}

.point-info {
  flex: 1;
}

.point-name {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.point-desc {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}

.point-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1989fa;

  .van-icon {
    font-size: 12px;
  }
}
</style>
