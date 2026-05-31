<template>
  <div class="app-container">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon :size="32" color="#409EFF"><Document /></el-icon>
            <span class="title">简历模板管理系统</span>
          </div>
          <div class="header-info">
            <el-tag type="success">系统运行正常</el-tag>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="240px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            router
            background-color="#001529"
            text-color="#ffffff"
            active-text-color="#409EFF"
          >
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>首页概览</span>
            </el-menu-item>
            <el-menu-item index="/templates">
              <el-icon><Collection /></el-icon>
              <span>模板中心</span>
            </el-menu-item>
            <el-menu-item index="/categories">
              <el-icon><Menu /></el-icon>
              <span>分类管理</span>
            </el-menu-item>
            <el-menu-item index="/notes">
              <el-icon><EditPen /></el-icon>
              <span>简历备注</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

html, body, #app {
  height: 100%;
}

.app-container {
  height: 100%;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  height: 70px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  color: white;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 2px;
}

.sidebar {
  background: #001529;
  height: calc(100vh - 70px);
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.main-content {
  background: #f0f2f5;
  padding: 24px;
  min-height: calc(100vh - 70px);
}

.el-menu-item {
  height: 56px !important;
  line-height: 56px !important;
}

.el-menu-item:hover {
  background: rgba(64, 158, 255, 0.1) !important;
}
</style>
