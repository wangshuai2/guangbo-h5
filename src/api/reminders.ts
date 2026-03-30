// 开放时间提醒 API
import { request } from '@/utils/request'

export interface Reminder {
  id: number
  museumId: number
  museumName: string
  museumCover: string
  type: 'open' | 'close'  // 开馆提醒 | 闭馆提醒
  advanceMinutes: number  // 提前多少分钟提醒
  enabled: boolean
  createdAt: string
}

export interface CreateReminderParams {
  museumId: number
  type: 'open' | 'close'
  advanceMinutes: number
}

export interface UpdateReminderParams {
  id: number
  type?: 'open' | 'close'
  advanceMinutes?: number
  enabled?: boolean
}

// 获取提醒列表
export function getReminderList() {
  return request.get<{ list: Reminder[] }>('/v1/reminders')
}

// 创建提醒
export function createReminder(params: CreateReminderParams) {
  return request.post<Reminder>('/v1/reminders', params)
}

// 更新提醒
export function updateReminder(params: UpdateReminderParams) {
  return request.put<Reminder>(`/v1/reminders/${params.id}`, params)
}

// 删除提醒
export function deleteReminder(id: number) {
  return request.delete(`/v1/reminders/${id}`)
}

// 切换提醒开关
export function toggleReminder(id: number, enabled: boolean) {
  return request.put(`/v1/reminders/${id}`, { enabled })
}
