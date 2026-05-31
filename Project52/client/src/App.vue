<template>
  <div class="app-layout" :class="{ collapsed: sidebarCollapsed }">
    <aside class="sidebar">
      <div class="sidebar-header">
        <svg class="sidebar-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="#00E676" stroke-width="2" fill="none"/>
          <circle cx="20" cy="20" r="8" fill="#00E676" opacity="0.3"/>
          <path d="M20 5 L20 12 M20 28 L20 35 M5 20 L12 20 M28 20 L35 20" stroke="#00E676" stroke-width="1.5"/>
          <ellipse cx="20" cy="20" rx="14" ry="6" stroke="#1B3A5C" stroke-width="1" transform="rotate(45 20 20)"/>
        </svg>
        <span v-show="!sidebarCollapsed" class="sidebar-title">载荷管理</span>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span v-show="!sidebarCollapsed">仪表盘</span>
        </router-link>
        <router-link to="/experiments" class="nav-item" :class="{ active: $route.path.startsWith('/experiments') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
          <span v-show="!sidebarCollapsed">试验管理</span>
        </router-link>
        <router-link to="/data-collection" class="nav-item" :class="{ active: $route.path === '/data-collection' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <span v-show="!sidebarCollapsed">数据采集</span>
        </router-link>
        <router-link to="/data-parsing" class="nav-item" :class="{ active: $route.path === '/data-parsing' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>
          <span v-show="!sidebarCollapsed">数据解析</span>
        </router-link>
        <router-link to="/reports" class="nav-item" :class="{ active: $route.path.startsWith('/reports') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span v-show="!sidebarCollapsed">报告中心</span>
        </router-link>
        <router-link to="/devices" class="nav-item" :class="{ active: $route.path.startsWith('/devices') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><line x1="14" y1="10" x2="18" y2="10"/><line x1="14" y1="14" x2="18" y2="14"/></svg>
          <span v-show="!sidebarCollapsed">设备管理</span>
        </router-link>
      </nav>
    </aside>

    <div class="main-area">
      <header class="top-header">
        <button class="toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <h1 class="header-title">航天载荷试验数据管理系统</h1>
        <div class="header-right">
          <div class="header-time">{{ currentTime }}</div>
          <div class="header-status">
            <span class="status-dot online"></span>
            系统在线
          </div>
        </div>
      </header>
      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const sidebarCollapsed = ref(false)
const currentTime = ref('')

let timer = null

function updateTime() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  currentTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
