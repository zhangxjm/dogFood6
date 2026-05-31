import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const handleLogin = async (username, password) => {
    try {
      const res = await login(username, password)
      if (res.code === 200) {
        token.value = res.data.token
        user.value = res.data.user
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        ElMessage.success('登录成功')
        return true
      } else {
        ElMessage.error(res.message)
        return false
      }
    } catch (error) {
      ElMessage.error('登录失败')
      return false
    }
  }

  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo()
      if (res.code === 200) {
        user.value = res.data
        localStorage.setItem('user', JSON.stringify(res.data))
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    ElMessage.success('已退出登录')
  }

  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    handleLogin,
    fetchUserInfo,
    logout,
    initUser
  }
})
