import { request } from '@/utils/request'
import type { LoginParams, LoginResponse, User, PhoneLoginParams, SendSmsParams } from '@/types'

// 微信登录
export function wechatLogin(params: LoginParams) {
  return request.post<LoginResponse>('/v1/auth/wechat-login', params)
}

// 手机号登录
export function phoneLogin(params: PhoneLoginParams) {
  return request.post<LoginResponse>('/v1/auth/phone-login', params)
}

// 发送短信验证码
export function sendSmsCode(params: SendSmsParams) {
  return request.post<{ success: boolean }>('/v1/auth/send-sms', params)
}

// 刷新 Token
export function refreshToken(token: string) {
  return request.post<{ token: string; expiresIn: number }>('/v1/auth/refresh-token', { token })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get<User>('/v1/users/me')
}

// 更新用户信息
export function updateUserInfo(data: { nickname?: string; avatar?: string }) {
  return request.put<User>('/v1/users/me', data)
}