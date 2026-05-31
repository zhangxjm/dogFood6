import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', requiresAuth: true }
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: () => import('@/views/rooms/RoomList.vue'),
        meta: { title: '房源列表', requiresAuth: true }
      },
      {
        path: 'room-detail/:id',
        name: 'RoomDetail',
        component: () => import('@/views/rooms/RoomDetail.vue'),
        meta: { title: '房源详情', requiresAuth: true }
      },
      {
        path: 'packages',
        name: 'Packages',
        component: () => import('@/views/packages/PackageList.vue'),
        meta: { title: '服务套餐', requiresAuth: true }
      },
      {
        path: 'booking',
        name: 'Booking',
        component: () => import('@/views/booking/BookingCreate.vue'),
        meta: { title: '预订房间', requiresAuth: true }
      },
      {
        path: 'my-bookings',
        name: 'MyBookings',
        component: () => import('@/views/booking/MyBookings.vue'),
        meta: { title: '我的预订', requiresAuth: true }
      },
      {
        path: 'health',
        name: 'Health',
        component: () => import('@/views/health/HealthData.vue'),
        meta: { title: '健康数据', requiresAuth: true }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/chat/Chat.vue'),
        meta: { title: '在线咨询', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理', requiresAuth: true, roles: ['ADMIN'] }
      },
      {
        path: 'admin/rooms',
        name: 'AdminRooms',
        component: () => import('@/views/admin/RoomManage.vue'),
        meta: { title: '房间管理', requiresAuth: true, roles: ['ADMIN'] }
      },
      {
        path: 'admin/packages',
        name: 'AdminPackages',
        component: () => import('@/views/admin/PackageManage.vue'),
        meta: { title: '套餐管理', requiresAuth: true, roles: ['ADMIN'] }
      },
      {
        path: 'admin/bookings',
        name: 'AdminBookings',
        component: () => import('@/views/admin/BookingManage.vue'),
        meta: { title: '预订管理', requiresAuth: true, roles: ['ADMIN', 'STAFF'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(userStore.user?.role)) {
    next('/home')
  } else {
    next()
  }
})

export default router
