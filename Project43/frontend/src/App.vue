<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

watch(() => route.path, (path) => {
  const token = localStorage.getItem('token')
  const publicPaths = ['/login']
  
  if (!token && !publicPaths.includes(path)) {
    router.push('/login')
  } else if (token && publicPaths.includes(path)) {
    authStore.loadUser()
    router.push('/dashboard')
  }
}, { immediate: true })
</script>

<template>
  <router-view />
</template>
