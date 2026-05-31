<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ChevronRight } from 'lucide-vue-next'

const route = useRoute()

interface BreadcrumbItem {
  title: string
  path?: string
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const items: BreadcrumbItem[] = [{ title: '首页', path: '/dashboard' }]
  
  matched.forEach((item, index) => {
    const isLast = index === matched.length - 1
    items.push({
      title: item.meta.title as string,
      path: isLast ? undefined : item.path
    })
  })
  
  return items
})
</script>

<template>
  <div class="px-6 py-3 bg-white border-b border-gray-100">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="index"
        :to="item.path"
      >
        <div class="flex items-center gap-1.5">
          <Home v-if="index === 0" class="w-3.5 h-3.5" />
          <span>{{ item.title }}</span>
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<style scoped>
:deep(.el-breadcrumb__inner) {
  color: #86909C;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: #165DFF;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #1D2129;
  font-weight: 500;
}
</style>
