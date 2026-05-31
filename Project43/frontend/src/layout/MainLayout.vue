<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { MenuItem } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isCollapse = ref(false)

const menuItems = computed(() => {
  const items = [
    { path: '/dashboard', title: '系统概览', icon: 'Odometer' },
    { path: '/training', title: '康复训练', icon: 'VideoPlay' },
    { path: '/progress', title: '训练进度', icon: 'TrendCharts' },
    { path: '/analytics', title: '数据分析', icon: 'DataAnalysis' },
    { path: '/history', title: '历史记录', icon: 'Clock' },
  ]
  
  if (authStore.userRole === 'admin' || authStore.userRole === 'doctor') {
    items.splice(5, 0, { path: '/patients', title: '患者管理', icon: 'User' })
  }
  
  return items
})

const activeMenu = computed(() => route.path)

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}

const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '系统管理员',
    doctor: '医生',
    patient: '患者'
  }
  return roleMap[role] || role
}
</script>

<template>
  <el-container class="layout-container" style="height: 100vh">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <img src="/brain.svg" alt="logo" class="logo-img" />
        <span v-if="!isCollapse" class="logo-text">BCI康复训练</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#1e293b"
        text-color="#cbd5e1"
        active-text-color="#409eff"
        router
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-info">
              <el-avatar :size="32" style="background: #409eff">
                {{ authStore.userName?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ authStore.userName }}</span>
              <el-tag size="small" type="info" class="user-role">
                {{ getRoleName(authStore.userRole) }}
              </el-tag>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><Setting /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  background: #f0f2f5;
}

.sidebar {
  background: #1e293b;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #334155;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  margin-left: 12px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item:hover) {
  background: #334155 !important;
}

:deep(.el-menu-item.is-active) {
  background: #1e40af !important;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f1f5f9;
}

.user-name {
  font-size: 14px;
  color: #334155;
}

.user-role {
  margin-left: 4px;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
  background: #f0f2f5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
