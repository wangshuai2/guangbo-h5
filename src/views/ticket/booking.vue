<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'
import type { TicketInfo, BookingResult } from '@/api/ticket-booking'

const route = useRoute()
const router = useRouter()

const museumId = computed(() => Number(route.params.id))
const loading = ref(false)

// 门票信息
const ticketInfo = ref<TicketInfo | null>(null)

// 预约表单
const bookingForm = ref({
  visitDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  timeSlot: '',
  visitorName: '',
  visitorPhone: '',
  visitorIdCard: ''
})

const showDatePicker = ref(false)

function onDateConfirm(value: { value: string }) {
  bookingForm.value.visitDate = value.value
  showDatePicker.value = false
}

// 日期选项
const dateOptions = computed(() => {
  if (!ticketInfo.value) return []
  return ticketInfo.value.availableDates.map(date => ({
    text: dayjs(date).format('MM月DD日'),
    value: date
  }))
})

// 时段选项
const timeSlotOptions = computed(() => {
  if (!ticketInfo.value) return []
  return ticketInfo.value.timeSlots.map(slot => ({
    text: `${slot.time} (余${slot.available}/${slot.total})`,
    value: slot.time,
    disabled: slot.available === 0
  }))
})

// 获取门票信息
async function fetchTicketInfo() {
  loading.value = true
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // TODO: 使用真实 API
    // const res = await getTicketInfo(museumId.value)
    // ticketInfo.value = res.data
    
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 500))
    ticketInfo.value = {
      museumId: museumId.value,
      museumName: '故宫博物院',
      price: 60,
      isFree: false,
      availableDates: [
        dayjs().add(1, 'day').format('YYYY-MM-DD'),
        dayjs().add(2, 'day').format('YYYY-MM-DD'),
        dayjs().add(3, 'day').format('YYYY-MM-DD')
      ],
      timeSlots: [
        { time: '08:30-10:30', available: 50, total: 100 },
        { time: '10:30-12:30', available: 30, total: 100 },
        { time: '13:30-15:30', available: 80, total: 100 }
      ],
      rules: [
        '请携带身份证原件入园',
        '门票当日有效，过期作废',
        '如需退票请提前1小时申请'
      ]
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 提交预约
async function handleBooking() {
  if (!ticketInfo.value) return

  if (!bookingForm.value.timeSlot) {
    showToast('请选择参观时段')
    return
  }

  if (!bookingForm.value.visitorName.trim()) {
    showToast('请输入参观人姓名')
    return
  }

  if (!bookingForm.value.visitorPhone.trim()) {
    showToast('请输入联系电话')
    return
  }

  if (!bookingForm.value.visitorIdCard.trim()) {
    showToast('请输入身份证号')
    return
  }

  try {
    showLoadingToast({
      message: '预约中...',
      forbidClick: true,
      duration: 0
    })

    // TODO: 使用真实 API
    // const res = await bookTicket({
    //   museumId: museumId.value,
    //   ...bookingForm.value
    // })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showToast('预约成功')
    router.push('/ticket/list')
  } catch (error) {
    showToast('预约失败')
  } finally {
    closeToast()
  }
}

onMounted(() => {
  fetchTicketInfo()
})
</script>

<template>
  <div class="ticket-booking-page">
    <van-nav-bar
      title="门票预约"
      left-arrow
      @click-left="router.back()"
    />

    <div v-if="ticketInfo" class="page-content">
      <!-- 博物馆信息 -->
      <div class="museum-info">
        <div class="museum-name">{{ ticketInfo.museumName }}</div>
        <div class="ticket-price">
          <template v-if="ticketInfo.isFree">
            <span class="free">免费</span>
          </template>
          <template v-else>
            <span class="price">¥{{ ticketInfo.price }}</span>
            <span class="unit">/人</span>
          </template>
        </div>
      </div>

      <!-- 预约表单 -->
      <div class="booking-form">
        <div class="form-section">
          <div class="section-title">选择日期</div>
          <van-field
            v-model="bookingForm.visitDate"
            readonly
            placeholder="请选择日期"
            @click="showDatePicker = true"
          />
          <van-popup v-model:show="showDatePicker" position="bottom">
            <van-picker
              :columns="dateOptions"
              @confirm="onDateConfirm"
              @cancel="showDatePicker = false"
            />
          </van-popup>
        </div>

        <div class="form-section">
          <div class="section-title">选择时段</div>
          <div class="time-slots">
            <van-tag
              v-for="slot in timeSlotOptions"
              :key="slot.value"
              :type="bookingForm.timeSlot === slot.value ? 'primary' : 'default'"
              :class="{ disabled: slot.disabled }"
              size="large"
              @click="!slot.disabled && (bookingForm.timeSlot = slot.value)"
            >
              {{ slot.text }}
            </van-tag>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">参观人信息</div>
          <van-field
            v-model="bookingForm.visitorName"
            label="姓名"
            placeholder="请输入真实姓名"
            required
          />
          <van-field
            v-model="bookingForm.visitorPhone"
            label="电话"
            placeholder="请输入联系电话"
            type="tel"
            required
          />
          <van-field
            v-model="bookingForm.visitorIdCard"
            label="身份证"
            placeholder="请输入身份证号"
            required
          />
        </div>

        <!-- 预约规则 -->
        <div class="rules-section">
          <div class="section-title">预约须知</div>
          <div class="rules-list">
            <div
              v-for="(rule, index) in ticketInfo.rules"
              :key="index"
              class="rule-item"
            >
              <van-icon name="info-o" />
              <span>{{ rule }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <div class="price-summary">
          <span>合计:</span>
          <span class="total-price">
            {{ ticketInfo.isFree ? '免费' : '¥' + ticketInfo.price }}
          </span>
        </div>
        <van-button
          block
          round
          type="primary"
          size="large"
          @click="handleBooking"
        >
          立即预约
        </van-button>
      </div>
    </div>

    <van-empty v-else-if="!loading" description="暂无门票信息" />
  </div>
</template>

<style lang="scss" scoped>
.ticket-booking-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 100px;
}

.page-content {
  padding: 12px;
}

.museum-info {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  text-align: center;
}

.museum-name {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.ticket-price {
  .price {
    font-size: 32px;
    font-weight: 600;
    color: #ff4d4f;
  }

  .unit {
    font-size: 14px;
    color: #969799;
  }

  .free {
    font-size: 24px;
    color: #07c160;
    font-weight: 600;
  }
}

.booking-form {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.form-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .van-tag {
    cursor: pointer;

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.rules-section {
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #969799;

  .van-icon {
    color: #ff976a;
    margin-top: 2px;
  }
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #ebedf0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.price-summary {
  flex: 1;
  font-size: 14px;
  color: #646566;

  .total-price {
    font-size: 24px;
    font-weight: 600;
    color: #ff4d4f;
    margin-left: 8px;
  }
}
</style>
