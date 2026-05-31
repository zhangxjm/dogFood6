<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon class="logo-icon"><Document /></el-icon>
        <span class="logo-text">文创申报系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="side-menu"
        background-color="#1f2d3d"
        text-color="#c0c4cc"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-sub-menu index="declarations">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>申报单管理</span>
          </template>
          <el-menu-item index="/declarations">申报单列表</el-menu-item>
          <el-menu-item index="/declarations/new">新建申报单</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Menu /></el-icon>
          <span>商品分类</span>
        </el-menu-item>
        <el-menu-item index="/tax-calculator">
          <el-icon><Calculator /></el-icon>
          <span>税费计算器</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><Timer /></el-icon>
          <span>任务中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
            <el-icon><User /></el-icon>
            <span>管理员</span>
          </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.sidebar {
  background-color: #1f2d3d;
  border-right: 1px solid #e4e7ed;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #1f2d3d;
  border-bottom: 1px solid #304156;
}

.logo-icon {
  font-size: 24px;
  color: #ffd04b;
  margin-right: 10px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.side-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
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
  gap: 8px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
