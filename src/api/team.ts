// 组队打卡 API
import { request } from '@/utils/request'

export interface Team {
  id: number
  name: string
  leaderId: number
  leaderName: string
  leaderAvatar: string | null
  museumId: number
  museumName: string
  museumCover: string
  description?: string
  maxMembers: number
  currentMembers: number
  members: TeamMember[]
  status: 'recruiting' | 'active' | 'completed' | 'cancelled'
  scheduledAt: string
  createdAt: string
}

export interface TeamMember {
  id: number
  userId: number
  nickname: string
  avatar: string | null
  joinedAt: string
}

export interface TeamListParams {
  museumId?: number
  status?: string
  page?: number
  pageSize?: number
}

export interface CreateTeamParams {
  museumId: number
  name: string
  description?: string
  maxMembers: number
  scheduledAt: string
}

// 获取组队列表
export function getTeamList(params?: TeamListParams) {
  return request.get<{ list: Team[]; pagination: { page: number; pageSize: number; total: number; hasMore: boolean } }>('/v1/team-checkin/teams', { params })
}

// 获取我参与的队伍
export function getMyTeams() {
  return request.get<{ list: Team[] }>('/v1/team-checkin/teams/my')
}

// 获取队伍详情
export function getTeamDetail(id: number) {
  return request.get<Team>(`/v1/team-checkin/teams/${id}`)
}

// 创建队伍
export function createTeam(params: CreateTeamParams) {
  return request.post<Team>('/v1/team-checkin/teams', params)
}

// 加入队伍
export function joinTeam(id: number) {
  return request.post(`/v1/team-checkin/teams/${id}/join`)
}

// 退出队伍
export function leaveTeam(id: number) {
  return request.post(`/v1/team-checkin/teams/${id}/leave`)
}

// 解散队伍
export function disbandTeam(id: number) {
  return request.delete(`/v1/team-checkin/teams/${id}`)
}

// 踢出成员
export function kickMember(teamId: number, userId: number) {
  return request.post(`/v1/team-checkin/teams/${teamId}/kick`, { userId })
}

// 团队打卡
export function teamCheckin(id: number, data: { latitude: number; longitude: number }) {
  return request.post(`/v1/team-checkin/teams/${id}/checkin`, data)
}
