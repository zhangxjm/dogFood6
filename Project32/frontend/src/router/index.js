import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Pets from '../views/Pets.vue'
import Videos from '../views/Videos.vue'
import Analyses from '../views/Analyses.vue'
import Training from '../views/Training.vue'
import BehaviorTypes from '../views/BehaviorTypes.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/pets',
    name: 'Pets',
    component: Pets
  },
  {
    path: '/videos',
    name: 'Videos',
    component: Videos
  },
  {
    path: '/analyses',
    name: 'Analyses',
    component: Analyses
  },
  {
    path: '/training',
    name: 'Training',
    component: Training
  },
  {
    path: '/behavior-types',
    name: 'BehaviorTypes',
    component: BehaviorTypes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
