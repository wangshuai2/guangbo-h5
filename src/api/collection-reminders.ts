import { request } from '@/utils/request'

export interface CollectionReminder {
  id: number
  museumId: number
  museumName: string
  museumCover: string
  type: 'exhibit_open' | 'special_event' | 'new_exhibit'
  enabled: boolean
  createdAt: string
}

export function getCollectionReminders() {
  return request.get<{ list: CollectionReminder[] }>('/v1/collections/reminders')
}

export function createCollectionReminder(data: { museumId: number; type: string }) {
  return request.post('/v1/collections/reminders', data)
}

export function deleteCollectionReminder(id: number) {
  return request.delete('/v1/collections/reminders/' + id)
}

export function toggleCollectionReminder(id: number, enabled: boolean) {
  return request.put('/v1/collections/reminders/' + id, { enabled })
}
