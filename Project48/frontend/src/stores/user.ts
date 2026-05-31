import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { authApi } from '@/api/auth'

const TOKEN_KEY = 'iiot_token'
const USER_KEY = 'iiot_user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const isManager = computed(() => userInfo.value?.role === 'admin' || userInfo.value?.role === 'manager')

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info
    if (info) {
      localStorage.setItem(USER_KEY, JSON.stringify(info))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  async function login(username: string, password: string) {
    const response = await authApi.login({ username, password })
    setToken(response.token)
    setUserInfo(response.user)
    return response
  }

  async function fetchUserInfo() {
    if (!token.value) return null
    try {
      const info = await authApi.getCurrentUser()
      setUserInfo(info)
      return info
    } catch (error) {
      setToken('')
      setUserInfo(null)
      throw error
    }
  }

  function logout() {
    setToken('')
    setUserInfo(null)
  }

  function loadStoredUser() {
    const stored = localStorage.getItem(USER_KEY)
    if (stored && token.value) {
      try {
        userInfo.value = JSON.parse(stored)
      } catch {
        userInfo.value = null
      }
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    isManager,
    login,
    fetchUserInfo,
    logout,
    loadStoredUser,
    setToken,
    setUserInfo
  }
})

export default useUserStore
