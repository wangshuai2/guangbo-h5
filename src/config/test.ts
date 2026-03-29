/**
 * 测试环境配置
 * 用于开发测试时自动注入测试账户
 */

// 测试账户信息
export const TEST_ACCOUNT = {
  // 用户 ID
  userId: 1,
  // 手机号
  phone: '13800138000',
  // 密码
  password: 'test123456',
  // 昵称
  nickname: '测试用户',
  // 头像
  avatar: 'https://picsum.photos/100/100',
}

// 测试 JWT Token（可用于所有 H5 端接口访问）
export const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzc0Nzg5NDU3LCJleHAiOjE3NzUzOTQyNTd9.3gXUc_Pa-OVWDI-gXVqTOHHxft2F3VTUNe2AxDjiX8o'

// Token 有效期（7天）
export const TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000

// 是否启用自动注入测试 Token（开发环境）
export const AUTO_INJECT_TEST_TOKEN = import.meta.env.DEV

/**
 * 初始化测试 Token
 * 在开发环境下自动注入测试 Token 到 localStorage
 */
export function initTestToken() {
  if (AUTO_INJECT_TEST_TOKEN) {
    const existingToken = localStorage.getItem('token')
    if (!existingToken) {
      console.log('[测试模式] 自动注入测试 Token')
      localStorage.setItem('token', TEST_TOKEN)
    }
  }
}

/**
 * 清除测试 Token
 */
export function clearTestToken() {
  localStorage.removeItem('token')
  console.log('[测试模式] Token 已清除')
}