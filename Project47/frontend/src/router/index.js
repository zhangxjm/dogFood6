import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue')
  },
  {
    path: '/evidence',
    name: 'Evidence',
    component: () => import('@/views/Evidence.vue')
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('@/views/Cases.vue')
  },
  {
    path: '/copyright',
    name: 'Copyright',
    component: () => import('@/views/Copyright.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
