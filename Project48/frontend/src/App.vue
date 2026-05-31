<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { ElLoading } from 'element-plus'

const appStore = useAppStore()

const loadingOptions = computed(() => ({
  lock: true,
  text: '加载中...',
  background: 'rgba(255, 255, 255, 0.7)'
}))
</script>

<template>
  <el-loading v-if="appStore.loading" :fullscreen="true" v-bind="loadingOptions" />
  <router-view />
</template>

<style scoped>
#app {
  height: 100%;
  width: 100%;
}
</style>
