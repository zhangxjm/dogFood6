<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <h1 class="title">
          <el-icon size="32" color="#409EFF"><VideoCamera /></el-icon>
          宠物行为AI分析训练系统
        </h1>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" class="aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="menu"
        >
          <el-menu-item index="/">
            <el-icon><DataBoard /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/pets">
            <el-icon><OfficeBuilding /></el-icon>
            <span>宠物管理</span>
          </el-menu-item>
          <el-menu-item index="/videos">
            <el-icon><VideoCamera /></el-icon>
            <span>视频上传</span>
          </el-menu-item>
          <el-menu-item index="/analyses">
            <el-icon><TrendCharts /></el-icon>
            <span>行为分析</span>
          </el-menu-item>
          <el-menu-item index="/training">
            <el-icon><Reading /></el-icon>
            <span>训练方案</span>
          </el-menu-item>
          <el-menu-item index="/behavior-types">
            <el-icon><List /></el-icon>
            <span>行为类型</span>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)

const handleMenuClick = (index) => {
  router.push(index)
}
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

.layout-container {
  height: 100%;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  display: flex;
  align-items: center;
}

.header-content {
  padding: 0 20px;
}

.title {
  color: white;
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.menu {
  border-right: none;
  height: calc(100vh - 60px);
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
