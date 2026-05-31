<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h2>康养预订系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/rooms">
          <el-icon><OfficeBuilding /></el-icon>
          <span>房源列表</span>
        </el-menu-item>
        <el-menu-item index="/packages">
          <el-icon><Present /></el-icon>
          <span>服务套餐</span>
        </el-menu-item>
        <el-menu-item index="/my-bookings">
          <el-icon><Tickets /></el-icon>
          <span>我的预订</span>
        </el-menu-item>
        <el-menu-item index="/health">
          <el-icon><Heart /></el-icon>
          <span>健康数据</span>
        </el-menu-item>
        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>在线咨询</span>
        </el-menu-item>
        <el-sub-menu index="/admin" v-if="isAdminOrStaff">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/admin/users" v-if="isAdmin">用户管理</el-menu-item>
          <el-menu-item index="/admin/rooms" v-if="isAdmin">房间管理</el-menu-item>
          <el-menu-item index="/admin/packages" v-if="isAdmin">套餐管理</el-menu-item>
          <el-menu-item index="/admin/bookings">预订管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" class="mr-10">
                {{ userStore.user?.realName?.charAt(0) || 'U' }}
              </el-avatar>
              {{ userStore.user?.realName || '用户' }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  userStore.initUser()
})

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta?.title || '')

const isAdmin = computed(() => userStore.user?.role === 'ADMIN')
const isAdminOrStaff = computed(() => ['ADMIN', 'STAFF'].includes(userStore.user?.role))

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.el-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  margin-left: 220px;
  min-height: calc(100vh - 60px);
}
</style>
