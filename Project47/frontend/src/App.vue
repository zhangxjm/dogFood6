<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="logo">
        <el-icon size="32"><Shield /></el-icon>
        <span class="title">跨境电商知识产权维权系统</span>
      </div>
      <div class="header-info">
        <el-tag type="success">系统运行正常</el-tag>
      </div>
    </el-header>
    
    <el-container>
      <el-aside width="220px" class="aside">
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#001529"
          text-color="#ffffffa6"
          active-text-color="#ffffff"
          class="menu"
        >
          <el-menu-item index="/">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>侵权商品监测</span>
          </el-menu-item>
          <el-menu-item index="/evidence">
            <el-icon><Document /></el-icon>
            <span>证据管理</span>
          </el-menu-item>
          <el-menu-item index="/cases">
            <el-icon><Scale /></el-icon>
            <span>维权案件追踪</span>
          </el-menu-item>
          <el-menu-item index="/copyright">
            <el-icon><Collection /></el-icon>
            <span>版权作品管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="main">
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

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f0f2f5;
}

.layout-container {
  height: 100vh;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.aside {
  background-color: #001529;
}

.menu {
  border-right: none;
  height: 100%;
}

.main {
  background-color: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}
</style>
