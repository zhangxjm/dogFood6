<template>
  <el-container class="main-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🧁</span>
          <span class="logo-text">烘焙私房甜品预定管理系统</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
          background-color="transparent"
          text-color="#8b4513"
          active-text-color="#d2691e"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/desserts">
            <el-icon><Cake /></el-icon>
            <span>甜品款式</span>
          </el-menu-item>
          <el-menu-item index="/desserts/manage">
            <el-icon><Edit /></el-icon>
            <span>甜品管理</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <span>订单列表</span>
          </el-menu-item>
          <el-menu-item index="/orders/create">
            <el-icon><Plus /></el-icon>
            <span>创建订单</span>
          </el-menu-item>
          <el-menu-item index="/progress">
            <el-icon><Clock /></el-icon>
            <span>制作进度</span>
          </el-menu-item>
          <el-menu-item index="/pickup">
            <el-icon><Check /></el-icon>
            <span>自提核销</span>
          </el-menu-item>
          <el-menu-item index="/pickup/records">
            <el-icon><Document /></el-icon>
            <span>核销记录</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
    <el-footer class="footer">
      <p>© 2024 烘焙私房甜品预定管理系统 | 用心烘焙，传递甜蜜</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.main-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #fff5e6 0%, #ffe4c4 100%);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
  padding: 0;
  height: auto !important;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.logo-icon {
  font-size: 32px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #8b4513;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.main-content {
  background-color: #fef7f0;
  padding: 20px;
}

.footer {
  background-color: #8b4513;
  color: #fff;
  text-align: center;
  padding: 20px 0;
  height: auto !important;
}

.footer p {
  margin: 0;
  font-size: 14px;
}
</style>
