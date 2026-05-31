<template>
  <el-container style="height: 100vh">
    <el-header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; padding: 0 20px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <el-icon size="32"><PawPrint /></el-icon>
        <h1 style="margin: 0; font-size: 22px;">宠物洗护门店管理系统</h1>
      </div>
      <div style="margin-left: auto; font-size: 14px;">
        {{ currentTime }}
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" style="background: #f5f7fa; border-right: 1px solid #e4e7ed;">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          @select="handleMenuSelect"
          style="border-right: none;"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/members">
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          <el-menu-item index="/pets">
            <el-icon><PawPrint /></el-icon>
            <span>宠物管理</span>
          </el-menu-item>
          <el-menu-item index="/grooming-items">
            <el-icon><Collection /></el-icon>
            <span>洗护项目</span>
          </el-menu-item>
          <el-menu-item index="/grooming-records">
            <el-icon><Document /></el-icon>
            <span>洗护记录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="background: #f0f2f5; padding: 20px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeMenu = ref('/dashboard')
const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  router.push(index)
}

onMounted(() => {
  activeMenu.value = route.path
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.el-menu-item {
  font-size: 15px;
}

.el-header {
  height: 60px !important;
  line-height: 60px;
}
</style>
