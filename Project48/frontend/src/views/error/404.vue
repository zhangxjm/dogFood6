<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

function goHome() {
  router.push('/dashboard')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="mb-8">
        <h1 class="text-[120px] font-bold text-primary-500 leading-none">404</h1>
        <p class="text-2xl font-semibold text-gray-800 mt-4">页面不存在</p>
        <p class="text-gray-500 mt-2">抱歉，您访问的页面不存在或已被移除</p>
      </div>
      <div class="flex justify-center gap-4">
        <el-button type="primary" @click="goHome">
          <Home class="w-4 h-4 mr-2" />
          返回首页
        </el-button>
        <el-button @click="goBack">
          <ArrowLeft class="w-4 h-4 mr-2" />
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>
