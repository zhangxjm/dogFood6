<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="32" color="#409eff"><Van /></el-icon>
        <span class="logo-text">跨境集运系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        background-color="#1f2d3d"
        text-color="#c0ccda"
        active-text-color="#409eff"
        router
      >
        <el-menu-item index="/">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/parcels">
          <el-icon><Goods /></el-icon>
          <span>包裹管理</span>
        </el-menu-item>
        <el-menu-item index="/warehouses">
          <el-icon><OfficeBuilding /></el-icon>
          <span>仓库管理</span>
        </el-menu-item>
        <el-menu-item index="/tracking">
          <el-icon><Location /></el-icon>
          <span>物流追踪</span>
        </el-menu-item>
        <el-menu-item index="/sorting">
          <el-icon><Operation /></el-icon>
          <span>分拣调度</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="header-title">{{ pageTitle }}</span>
        <div class="header-right">
          <el-tag type="success">系统运行正常</el-tag>
          <span class="user-info">管理员</span>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles = {
    '/': '数据概览',
    '/parcels': '包裹管理',
    '/warehouses': '仓库管理',
    '/tracking': '物流追踪',
    '/sorting': '分拣调度'
  }
  return titles[route.path] || '跨境集运智能分拣调度系统'
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #1f2d3d;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid #3d4b65;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: #606266;
}

.main-content {
  background-color: #f5f7fa;
  overflow-y: auto;
  padding: 24px;
}
</style>
