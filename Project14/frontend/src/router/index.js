import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Devices from '../views/Devices.vue'
import Shipments from '../views/Shipments.vue'
import ShipmentDetail from '../views/ShipmentDetail.vue'
import Alerts from '../views/Alerts.vue'
import Customs from '../views/Customs.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/devices', component: Devices },
  { path: '/shipments', component: Shipments },
  { path: '/shipments/:id', component: ShipmentDetail },
  { path: '/alerts', component: Alerts },
  { path: '/customs', component: Customs },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
