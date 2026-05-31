<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Gauge, Cpu, TrendingDown, Wrench, Package, BarChart3, ChevronRight, Settings } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const menuItems = [
  {
    path: '/dashboard',
    title: '仪表盘',
    icon: Gauge
  },
  {
    path: '/devices',
    title: '设备管理',
    icon: Cpu,
    children: [
      { path: '/devices/list', title: '设备列表' }
    ]
  },
  {
    path: '/predictions',
    title: '故障预测',
    icon: TrendingDown,
    children: [
      { path: '/predictions/list', title: '预测列表' },
      { path: '/predictions/model', title: '模型信息' },
      { path: '/predictions/risk', title: '风险分析' }
    ]
  },
  {
    path: '/maintenance',
    title: '维护计划',
    icon: Wrench,
    children: [
      { path: '/maintenance/calendar', title: '计划日历' },
      { path: '/maintenance/tasks', title: '任务管理' }
    ]
  },
  {
    path: '/inventory',
    title: '备件库存',
    icon: Package,
    children: [
      { path: '/inventory/list', title: '库存列表' },
      { path: '/inventory/alerts', title: '库存预警' },
      { path: '/inventory/purchase', title: '采购建议' }
    ]
  },
  {
    path: '/analytics',
    title: '数据分析',
    icon: BarChart3,
    children: [
      { path: '/analytics/trend', title: '趋势分析' },
      { path: '/analytics/reports', title: '统计报表' }
    ]
  }
]

const isCollapsed = computed(() => appStore.sidebarCollapsed)

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

function handleMenuClick(path: string) {
  router.push(path)
}

function getIconComponent(iconName: string) {
  const iconMap: Record<string, unknown> = {
    Gauge,
    Cpu,
    TrendingDown,
    Wrench,
    Package,
    BarChart3,
    Settings
  }
  return iconMap[iconName] || Gauge
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 shadow-sm"
    :class="isCollapsed ? 'w-16' : 'w-55'"
    :style="{ width: appStore.sidebarWidth }"
  >
    <div class="h-16 flex items-center justify-center border-b border-gray-100 px-4">
      <div v-if="!isCollapsed" class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Cpu class="w-5 h-5 text-white" />
        </div>
        <span class="font-bold text-lg text-gray-800">预测性维护</span>
      </div>
      <div v-else class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
        <Cpu class="w-6 h-6 text-white" />
      </div>
    </div>

    <el-menu
      :default-active="route.path"
      :collapse="isCollapsed"
      :collapse-transition="false"
      background-color="#ffffff"
      text-color="#1D2129"
      active-text-color="#165DFF"
      class="border-none h-[calc(100%-64px)] overflow-y-auto"
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-sub-menu v-if="item.children" :index="item.path">
          <template #title>
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
            @click="handleMenuClick(child.path)"
          >
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path" @click="handleMenuClick(item.path)">
          <component :is="item.icon" class="w-5 h-5" />
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<style scoped>
.w-55 {
  width: 220px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 44px;
  line-height: 44px;
  padding-left: 48px !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(22, 93, 255, 0.1);
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(22, 93, 255, 0.06);
}
</style>
