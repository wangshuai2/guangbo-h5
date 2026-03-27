import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserStats } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<User | null>(null)
  const stats = ref<UserStats | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const level = computed(() => userInfo.value?.level || 1)
  const exp = computed(() => userInfo.value?.exp || 0)
  const medalCount = computed(() => userInfo.value?.medalCount || 0)
  const checkinCount = computed(() => userInfo.value?.checkinCount || 0)

  // Actions
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: User) {
    userInfo.value = info
  }

  function setStats(newStats: UserStats) {
    stats.value = newStats
  }

  function updateStats(partial: Partial<UserStats>) {
    if (stats.value) {
      stats.value = { ...stats.value, ...partial }
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    stats.value = null
    localStorage.removeItem('token')
  }

  return {
    // 状态
    token,
    userInfo,
    stats,
    // 计算属性
    isLoggedIn,
    level,
    exp,
    medalCount,
    checkinCount,
    // Actions
    setToken,
    setUserInfo,
    setStats,
    updateStats,
    logout
  }
})
