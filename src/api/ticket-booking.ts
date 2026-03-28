import { request } from '@/utils/request'

export interface TicketInfo {
  museumId: number
  museumName: string
  price: number
  isFree: boolean
  availableDates: string[]
  timeSlots: {
    time: string
    available: number
    total: number
  }[]
  rules: string[]
}

export interface BookingResult {
  orderId: string
  museumName: string
  visitDate: string
  timeSlot: string
  ticketCode: string
  qrCode: string
  status: 'pending' | 'confirmed' | 'used' | 'cancelled'
}

// 获取门票信息
export function getTicketInfo(museumId: number) {
  return request.get<TicketInfo>(`/ticket-booking/museum/${museumId}/info`)
}

// 预约门票
export function bookTicket(data: {
  museumId: number
  visitDate: string
  timeSlot: string
  visitorName: string
  visitorPhone: string
  visitorIdCard: string
}) {
  return request.post<BookingResult>('/ticket-booking/book', data)
}

// 获取预约列表
export function getBookingList() {
  return request.get<BookingResult[]>('/ticket-booking/list')
}

// 取消预约
export function cancelBooking(orderId: string) {
  return request.post(`/ticket-booking/${orderId}/cancel`)
}
