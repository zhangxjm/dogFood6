import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/parcels',
    component: () => import('../views/Parcels.vue')
  },
  {
    path: '/warehouses',
    component: () => import('../views/Warehouses.vue')
  },
  {
    path: '/tracking',
    component: () => import('../views/Tracking.vue')
  },
  {
    path: '/sorting',
    component: () => import('../views/Sorting.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
