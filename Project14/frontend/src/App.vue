<template>
  <el-container style="height: 100vh">
    <el-header style="background: #001529; color: white; display: flex; align-items: center; padding: 0 20px">
      <h2 style="margin: 0; color: white">❄️ 跨境冷链温控溯源系统</h2>
      <div style="flex: 1"></div>
      <span style="font-size: 14px; opacity: 0.8">Cross-border Cold Chain Traceability System</span>
    </el-header>
    <el-container>
      <el-aside width="220px" style="background: #001529">
        <el-menu
          :default-active="activeMenu"
          style="border-right: none"
          background-color="#001529"
          text-color="#ffffffa6"
          active-text-color="#1890ff"
          router
        >
          <el-menu-item index="/">
            <el-icon><DataLine /></el-icon>
            <span>监控概览</span>
          </el-menu-item>
          <el-menu-item index="/devices">
            <el-icon><Monitor /></el-icon>
            <span>设备管理</span>
          </el-menu-item>
          <el-menu-item index="/shipments">
            <el-icon><Box /></el-icon>
            <span>货物追踪</span>
          </el-menu-item>
          <el-menu-item index="/alerts">
            <el-icon><Warning /></el-icon>
            <span>告警中心</span>
          </el-menu-item>
          <el-menu-item index="/customs">
            <el-icon><Document /></el-icon>
            <span>海关核验</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="background: #f0f2f5; overflow-y: auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataLine, Monitor, Box, Warning, Document } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.el-menu-item {
  height: 50px !important;
  line-height: 50px !important;
}
</style>
