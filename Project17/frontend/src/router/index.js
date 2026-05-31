import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据概览', icon: 'DataLine' }
  },
  {
    path: '/declarations',
    name: 'Declarations',
    component: () => import('@/views/declarations/DeclarationList.vue'),
    meta: { title: '申报单管理', icon: 'Document' }
  },
  {
    path: '/declarations/new',
    name: 'NewDeclaration',
    component: () => import('@/views/declarations/DeclarationForm.vue'),
    meta: { title: '新建申报单', icon: 'Plus' }
  },
  {
    path: '/declarations/:id',
    name: 'DeclarationDetail',
    component: () => import('@/views/declarations/DeclarationDetail.vue'),
    meta: { title: '申报单详情', icon: 'Document' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/products/ProductList.vue'),
    meta: { title: '商品管理', icon: 'Goods' }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/products/CategoryList.vue'),
    meta: { title: '商品分类', icon: 'Menu' }
  },
  {
    path: '/tax-calculator',
    name: 'TaxCalculator',
    component: () => import('@/views/TaxCalculator.vue'),
    meta: { title: '税费计算器', icon: 'Calculator' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TaskList.vue'),
    meta: { title: '任务中心', icon: 'Timer' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 跨境文创商品合规申报系统` : '跨境文创商品合规申报系统';
  next();
});

export default router;
