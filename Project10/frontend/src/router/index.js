import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/Members.vue')
  },
  {
    path: '/pets',
    name: 'Pets',
    component: () => import('../views/Pets.vue')
  },
  {
    path: '/grooming-items',
    name: 'GroomingItems',
    component: () => import('../views/GroomingItems.vue')
  },
  {
    path: '/grooming-records',
    name: 'GroomingRecords',
    component: () => import('../views/GroomingRecords.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
