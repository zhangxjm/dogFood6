import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(false)
  const currentPageTitle = ref<string>('')
  const loading = ref<boolean>(false)
  const theme = ref<'light' | 'dark'>('light')

  const sidebarWidth = computed(() => (sidebarCollapsed.value ? '64px' : '220px'))

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setPageTitle(title: string) {
    currentPageTitle.value = title
    document.title = title ? `${title} - 工业物联网设备预测性维护系统` : '工业物联网设备预测性维护系统'
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    sidebarCollapsed,
    currentPageTitle,
    loading,
    theme,
    sidebarWidth,
    toggleSidebar,
    setPageTitle,
    setLoading,
    toggleTheme
  }
})

export default useAppStore
