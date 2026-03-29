import { request } from '@/utils/request'

export interface TeamMember {
  userId: number
  nickname: string
  avatar: string
  isLeader: boolean
}

export interface Team {
  id: number
  name: string
  code: string
  museumId: number
  museumName: string
  members: TeamMember[]
  maxMembers: number
  status: 'waiting' | 'checked' | 'expired'
  createdAt: string
  expiresAt: string
}

// 创建组队
export function createTeam(data: {
  museumId: number
  name: string
  maxMembers: number
}) {
  return request.post<Team>('/team-checkin/create', data)
}

// 加入组队
export function joinTeam(code: string) {
  return request.post<Team>('/team-checkin/join', { code })
}

// 获取组队信息
export function getTeamInfo(teamId: number) {
  return request.get<Team>(`/team-checkin/${teamId}`)
}

// 组队打卡
export function teamCheckin(teamId: number) {
  return request.post(`/team-checkin/${teamId}/checkin`)
}

// 解散组队
export function dissolveTeam(teamId: number) {
  return request.post(`/team-checkin/${teamId}/dissolve`)
}
