<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Breadcrumb from './components/Breadcrumb.vue'

const appStore = useAppStore()

const mainStyle = computed(() => ({
  marginLeft: appStore.sidebarWidth,
  transition: 'margin-left 0.28s ease-out'
}))
</script>

<template>
  <div class="h-full flex">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0" :style="mainStyle">
      <Header />
      <Breadcrumb />
      <main class="flex-1 p-6 overflow-auto bg-gray-50">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
