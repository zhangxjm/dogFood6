<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-vue-next'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const userDropdownVisible = ref(false)

function toggleSidebar() {
  appStore.toggleSidebar()
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    router.push('/login')
  } catch {
  }
}

function getRoleText(role: string): string {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    manager: '经理',
    engineer: '工程师',
    operator: '操作员'
  }
  return roleMap[role] || role
}
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
    <div class="flex items-center gap-4">
      <button
        @click="toggleSidebar"
        class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu class="w-5 h-5 text-gray-600" />
      </button>
      <h1 class="text-xl font-semibold text-gray-800">{{ appStore.currentPageTitle }}</h1>
    </div>

    <div class="flex items-center gap-4">
      <button class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative">
        <Bell class="w-5 h-5 text-gray-600" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
      </button>

      <el-dropdown
        v-model:visible="userDropdownVisible"
        trigger="click"
        placement="bottom-end"
      >
        <div class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
          <div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <User class="w-5 h-5 text-primary-600" />
          </div>
          <div class="hidden md:block">
            <div class="text-sm font-medium text-gray-800">{{ userStore.userInfo?.name || '-' }}</div>
            <div class="text-xs text-gray-500">{{ getRoleText(userStore.userInfo?.role || '') }}</div>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-500 hidden md:block" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="w-48">
            <el-dropdown-item>
              <div class="flex items-center gap-2">
                <User class="w-4 h-4" />
                <span>个人中心</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div class="flex items-center gap-2">
                <Settings class="w-4 h-4" />
                <span>系统设置</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <div class="flex items-center gap-2 text-danger-500">
                <LogOut class="w-4 h-4" />
                <span>退出登录</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>
