import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/images',
      name: 'images',
      component: () => import('@/views/ImagesView.vue')
    },
    {
      path: '/annotation',
      name: 'annotation',
      component: () => import('@/views/AnnotationView.vue')
    },
    {
      path: '/detection',
      name: 'detection',
      component: () => import('@/views/DetectionView.vue')
    },
    {
      path: '/change-detection',
      name: 'change-detection',
      component: () => import('@/views/ChangeDetectionView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue')
    }
  ]
})

export default router
