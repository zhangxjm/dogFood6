import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '../views/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import OrderList from '../views/OrderList.vue'
import OrderForm from '../views/OrderForm.vue'
import OrderDetail from '../views/OrderDetail.vue'
import Reviews from '../views/Reviews.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '数据概览' }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: OrderList,
        meta: { title: '订单列表' }
      },
      {
        path: 'orders/new',
        name: 'OrderNew',
        component: OrderForm,
        meta: { title: '新增订单' }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: OrderDetail,
        meta: { title: '订单详情' }
      },
      {
        path: 'orders/:id/edit',
        name: 'OrderEdit',
        component: OrderForm,
        meta: { title: '编辑订单' }
      },
      {
        path: 'reviews',
        name: 'Reviews',
        component: Reviews,
        meta: { title: '服务评价' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
