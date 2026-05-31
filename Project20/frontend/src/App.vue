<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <h1 class="app-title">航天遥感影像智能解译平台</h1>
      </div>
      <div class="header-right">
        <el-tag type="success" effect="dark">系统运行中</el-tag>
      </div>
    </el-header>
    
    <el-container>
      <el-aside width="220px" class="app-aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="side-menu"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409eff"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页概览</span>
          </el-menu-item>
          <el-menu-item index="/images">
            <el-icon><Picture /></el-icon>
            <span>影像管理</span>
          </el-menu-item>
          <el-menu-item index="/annotation">
            <el-icon><Edit /></el-icon>
            <span>数据标注</span>
          </el-menu-item>
          <el-menu-item index="/detection">
            <el-icon><Search /></el-icon>
            <span>地物识别</span>
          </el-menu-item>
          <el-menu-item index="/change-detection">
            <el-icon><CopyDocument /></el-icon>
            <span>变化检测</span>
          </el-menu-item>
          <el-menu-item index="/search">
            <el-icon><ZoomIn /></el-icon>
            <span>数据检索</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background: linear-gradient(90deg, #001529 0%, #003a8c 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  color: #409eff;
}

.app-title {
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 2px;
}

.app-aside {
  background: #001529;
}

.side-menu {
  border-right: none;
  height: calc(100vh - 64px);
}

.app-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
