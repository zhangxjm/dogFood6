import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import DessertList from '@/views/DessertList.vue'
import DessertManage from '@/views/DessertManage.vue'
import OrderList from '@/views/OrderList.vue'
import OrderCreate from '@/views/OrderCreate.vue'
import ProgressManage from '@/views/ProgressManage.vue'
import PickupVerify from '@/views/PickupVerify.vue'
import PickupRecords from '@/views/PickupRecords.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/desserts',
    name: 'DessertList',
    component: DessertList,
    meta: { title: '甜品款式' }
  },
  {
    path: '/desserts/manage',
    name: 'DessertManage',
    component: DessertManage,
    meta: { title: '甜品管理' }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: OrderList,
    meta: { title: '订单列表' }
  },
  {
    path: '/orders/create',
    name: 'OrderCreate',
    component: OrderCreate,
    meta: { title: '创建订单' }
  },
  {
    path: '/progress',
    name: 'ProgressManage',
    component: ProgressManage,
    meta: { title: '制作进度' }
  },
  {
    path: '/pickup',
    name: 'PickupVerify',
    component: PickupVerify,
    meta: { title: '自提核销' }
  },
  {
    path: '/pickup/records',
    name: 'PickupRecords',
    component: PickupRecords,
    meta: { title: '核销记录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 烘焙私房甜品预定管理系统` : '烘焙私房甜品预定管理系统'
  next()
})

export default router
