import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: () => import('../views/Marketplace.vue'),
    meta: { title: '藏品市场' },
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('../views/Collections.vue'),
    meta: { title: '非遗系列' },
  },
  {
    path: '/nft/:id',
    name: 'NFTDetail',
    component: () => import('../views/NFTDetail.vue'),
    meta: { title: '藏品详情' },
  },
  {
    path: '/collection/:id',
    name: 'CollectionDetail',
    component: () => import('../views/CollectionDetail.vue'),
    meta: { title: '系列详情' },
  },
  {
    path: '/mint',
    name: 'Mint',
    component: () => import('../views/Mint.vue'),
    meta: { title: '铸造藏品', requiresAuth: true },
  },
  {
    path: '/copyright',
    name: 'Copyright',
    component: () => import('../views/Copyright.vue'),
    meta: { title: '版权确权', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  document.title = `${to.meta.title} - 非遗数字藏品平台`;

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
