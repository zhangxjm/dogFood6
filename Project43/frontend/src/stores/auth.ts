import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/api'
import { authAPI } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || '')
  const userName = computed(() => user.value?.name || '')
  const userId = computed(() => user.value?.id || 0)

  const login = async (username: string, password: string) => {
    const response = await authAPI.login({ username, password })
    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const loadUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        logout()
      }
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.error('Failed to refresh user:', e)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    userName,
    userId,
    login,
    logout,
    loadUser,
    refreshUser,
    updateUser
  }
})
