import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '系统概览', icon: 'Odometer' }
      },
      {
        path: 'training',
        name: 'Training',
        component: () => import('@/views/Training.vue'),
        meta: { title: '康复训练', icon: 'VideoPlay' }
      },
      {
        path: 'training/session/:sessionId',
        name: 'TrainingSession',
        component: () => import('@/views/TrainingSession.vue'),
        meta: { title: '训练中', icon: 'Cpu', hidden: true }
      },
      {
        path: 'progress',
        name: 'Progress',
        component: () => import('@/views/Progress.vue'),
        meta: { title: '训练进度', icon: 'TrendCharts' }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/Analytics.vue'),
        meta: { title: '数据分析', icon: 'DataAnalysis' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/History.vue'),
        meta: { title: '历史记录', icon: 'Clock' }
      },
      {
        path: 'eeg-monitor/:sessionId',
        name: 'EEGMonitor',
        component: () => import('@/views/EEGMonitor.vue'),
        meta: { title: '脑电监测', icon: 'Monitor', hidden: true }
      },
      {
        path: 'patients',
        name: 'Patients',
        component: () => import('@/views/Patients.vue'),
        meta: { title: '患者管理', icon: 'User', roles: ['admin', 'doctor'] }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', icon: 'Setting', hidden: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.roles && token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (to.meta.roles && !to.meta.roles.includes(user.role)) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
