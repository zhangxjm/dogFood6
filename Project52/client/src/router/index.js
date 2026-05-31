import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/experiments', name: 'ExperimentList', component: () => import('../views/ExperimentList.vue') },
  { path: '/experiments/create', name: 'ExperimentCreate', component: () => import('../views/ExperimentCreate.vue') },
  { path: '/experiments/:id', name: 'ExperimentDetail', component: () => import('../views/ExperimentDetail.vue') },
  { path: '/data-collection', name: 'DataCollection', component: () => import('../views/DataCollection.vue') },
  { path: '/data-parsing', name: 'DataParsing', component: () => import('../views/DataParsing.vue') },
  { path: '/reports', name: 'ReportList', component: () => import('../views/ReportList.vue') },
  { path: '/reports/generate', name: 'ReportGenerate', component: () => import('../views/ReportList.vue') },
  { path: '/devices', name: 'DeviceList', component: () => import('../views/DeviceList.vue') },
  { path: '/devices/register', name: 'DeviceRegister', component: () => import('../views/DeviceList.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
