import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'PackageList',
    component: () => import('../views/PackageList.vue')
  },
  {
    path: '/package/:id',
    name: 'PackageDetail',
    component: () => import('../views/PackageDetail.vue')
  },
  {
    path: '/reservation',
    name: 'Reservation',
    component: () => import('../views/ReservationList.vue')
  },
  {
    path: '/reservation/create/:packageId',
    name: 'CreateReservation',
    component: () => import('../views/CreateReservation.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('../views/OrderList.vue')
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetail.vue')
  },
  {
    path: '/delivery',
    name: 'Delivery',
    component: () => import('../views/DeliveryList.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
