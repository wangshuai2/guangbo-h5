<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface CheckinRecord {
  id: number
  museumId: number
  museumName: string
  museumImage?: string
  city: string
  checkedAt: string
  exp: number
}

interface Props {
  records: CheckinRecord[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [record: CheckinRecord]
}>()

// 按日期分组
const groupedRecords = computed(() => {
  const groups: Record<string, CheckinRecord[]> = {}

  props.records.forEach(record => {
    const date = dayjs(record.checkedAt).format('YYYY-MM-DD')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(record)
  })

  return Object.entries(groups)
    .sort(([a], [b]) => dayjs(b).unix() - dayjs(a).unix())
    .map(([date, items]) => ({
      date,
      displayDate: formatDate(date),
      items
    }))
})

// 格式化日期
function formatDate(date: string): string {
  const d = dayjs(date)
  const today = dayjs()
  const yesterday = today.subtract(1, 'day')

  if (d.isSame(today, 'day')) {
    return '今天'
  } else if (d.isSame(yesterday, 'day')) {
    return '昨天'
  } else if (d.isSame(today, 'week')) {
    return d.format('dddd')
  } else {
    return d.format('MM月DD日')
  }
}

// 格式化时间
function formatTime(datetime: string): string {
  return dayjs(datetime).format('HH:mm')
}

function handleClick(record: CheckinRecord) {
  emit('click', record)
}
</script>

<template>
  <div class="checkin-timeline">
    <div class="timeline-header">
      <van-icon name="clock-o" />
      <span>打卡记录</span>
      <span class="count">共 {{ records.length }} 次打卡</span>
    </div>

    <div class="timeline-content">
      <div
        v-for="group in groupedRecords"
        :key="group.date"
        class="timeline-group"
      >
        <div class="timeline-date">
          <div class="date-dot"></div>
          <span class="date-text">{{ group.displayDate }}</span>
          <span class="date-count">{{ group.items.length }} 个博物馆</span>
        </div>

        <div class="timeline-items">
          <div
            v-for="record in group.items"
            :key="record.id"
            class="timeline-item"
            @click="handleClick(record)"
          >
            <div class="item-time">{{ formatTime(record.checkedAt) }}</div>
            <div class="item-content">
              <van-image
                v-if="record.museumImage"
                :src="record.museumImage"
                width="60"
                height="60"
                fit="cover"
                radius="8"
              />
              <div v-else class="item-placeholder">
                <van-icon name="photo-o" size="24" />
              </div>
              <div class="item-info">
                <div class="museum-name">{{ record.museumName }}</div>
                <div class="museum-location">
                  <van-icon name="location-o" size="12" />
                  {{ record.city }}
                </div>
                <div class="exp-gain">+{{ record.exp }} 经验</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-if="records.length === 0" description="暂无打卡记录" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkin-timeline {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin: 12px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 16px;

  .van-icon {
    color: #1989fa;
  }

  .count {
    font-size: 12px;
    color: #969799;
    font-weight: normal;
    margin-left: auto;
  }
}

.timeline-content {
  position: relative;
}

.timeline-group {
  position: relative;
  padding-left: 20px;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 8px;
    bottom: 0;
    width: 2px;
    background-color: #ebedf0;
  }

  &:last-child::before {
    display: none;
  }
}

.timeline-date {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;

  .date-dot {
    position: absolute;
    left: -20px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #1989fa;
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px #1989fa30;
  }

  .date-text {
    font-size: 14px;
    font-weight: 600;
    color: #323233;
  }

  .date-count {
    font-size: 12px;
    color: #969799;
  }
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ebedf0;
  }

  .item-time {
    font-size: 12px;
    color: #969799;
    min-width: 40px;
  }

  .item-content {
    flex: 1;
    display: flex;
    gap: 12px;
  }

  .item-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background-color: #ebedf0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #969799;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .museum-name {
      font-size: 14px;
      font-weight: 500;
      color: #323233;
    }

    .museum-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #969799;
    }

    .exp-gain {
      font-size: 12px;
      color: #ff976a;
      font-weight: 500;
    }
  }
}
</style>
