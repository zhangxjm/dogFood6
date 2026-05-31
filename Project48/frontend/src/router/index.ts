import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

NProgress.configure({ showSpinner: false, speed: 500 })

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false, hidden: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Gauge', requiresAuth: true }
      },
      {
        path: 'devices',
        name: 'Devices',
        redirect: '/devices/list',
        meta: { title: '设备管理', icon: 'Cpu', requiresAuth: true },
        children: [
          {
            path: 'list',
            name: 'DeviceList',
            component: () => import('@/views/devices/list.vue'),
            meta: { title: '设备列表', requiresAuth: true }
          },
          {
            path: ':id',
            name: 'DeviceDetail',
            component: () => import('@/views/devices/detail.vue'),
            meta: { title: '设备详情', requiresAuth: true, hidden: true }
          }
        ]
      },
      {
        path: 'predictions',
        name: 'Predictions',
        redirect: '/predictions/list',
        meta: { title: '故障预测', icon: 'TrendingDown', requiresAuth: true },
        children: [
          {
            path: 'list',
            name: 'PredictionList',
            component: () => import('@/views/predictions/list.vue'),
            meta: { title: '预测列表', requiresAuth: true }
          },
          {
            path: 'model',
            name: 'PredictionModel',
            component: () => import('@/views/predictions/model.vue'),
            meta: { title: '模型信息', requiresAuth: true }
          },
          {
            path: 'risk',
            name: 'RiskAnalysis',
            component: () => import('@/views/predictions/risk.vue'),
            meta: { title: '风险分析', requiresAuth: true }
          }
        ]
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        redirect: '/maintenance/calendar',
        meta: { title: '维护计划', icon: 'Wrench', requiresAuth: true },
        children: [
          {
            path: 'calendar',
            name: 'MaintenanceCalendar',
            component: () => import('@/views/maintenance/calendar.vue'),
            meta: { title: '计划日历', requiresAuth: true }
          },
          {
            path: 'tasks',
            name: 'MaintenanceTasks',
            component: () => import('@/views/maintenance/tasks.vue'),
            meta: { title: '任务管理', requiresAuth: true }
          }
        ]
      },
      {
        path: 'inventory',
        name: 'Inventory',
        redirect: '/inventory/list',
        meta: { title: '备件库存', icon: 'Package', requiresAuth: true },
        children: [
          {
            path: 'list',
            name: 'InventoryList',
            component: () => import('@/views/inventory/list.vue'),
            meta: { title: '库存列表', requiresAuth: true }
          },
          {
            path: 'alerts',
            name: 'InventoryAlerts',
            component: () => import('@/views/inventory/alerts.vue'),
            meta: { title: '库存预警', requiresAuth: true }
          },
          {
            path: 'purchase',
            name: 'PurchaseSuggestions',
            component: () => import('@/views/inventory/purchase.vue'),
            meta: { title: '采购建议', requiresAuth: true }
          }
        ]
      },
      {
        path: 'analytics',
        name: 'Analytics',
        redirect: '/analytics/trend',
        meta: { title: '数据分析', icon: 'BarChart3', requiresAuth: true },
        children: [
          {
            path: 'trend',
            name: 'TrendAnalysis',
            component: () => import('@/views/analytics/trend.vue'),
            meta: { title: '趋势分析', requiresAuth: true }
          },
          {
            path: 'reports',
            name: 'StatisticalReports',
            component: () => import('@/views/analytics/reports.vue'),
            meta: { title: '统计报表', requiresAuth: true }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  const userStore = useUserStore()
  const appStore = useAppStore()
  
  appStore.setPageTitle(to.meta.title as string)
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard')
    return
  }
  
  if (userStore.isLoggedIn && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      userStore.logout()
      next('/login')
      return
    }
  }
  
  next()
})

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})

export default router
