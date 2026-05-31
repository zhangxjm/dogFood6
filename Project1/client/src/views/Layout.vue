<template>
  <div class="app-layout">
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-icon :size="32" color="#fff"><Key /></el-icon>
          <h1>城市便民开锁服务登记系统</h1>
        </div>
        <div class="header-right">
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            background-color="transparent"
            text-color="#fff"
            active-text-color="#ffd04b"
            router
          >
            <el-menu-item index="/dashboard">数据概览</el-menu-item>
            <el-menu-item index="/orders">订单列表</el-menu-item>
            <el-menu-item index="/orders/new">新增订单</el-menu-item>
            <el-menu-item index="/reviews">服务评价</el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => {
  if (route.path.startsWith('/orders/new')) return '/orders/new'
  if (route.path.startsWith('/orders')) return '/orders'
  return route.path
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  margin-top: 4px;
}

.app-main {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

:deep(.el-menu) {
  border-bottom: none;
}

:deep(.el-menu--horizontal) {
  height: 40px;
  line-height: 40px;
}
</style>
