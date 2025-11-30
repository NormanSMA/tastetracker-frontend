import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Importación real
import LoginView from '@/views/auth/LoginView.vue'; 
import MainLayout from '@/layouts/MainLayout.vue';
import DashboardOverview from '@/views/dashboard/DashboardOverview.vue';
import ProductList from '@/views/products/ProductList.vue';
import OrderCreate from '@/views/orders/OrderCreate.vue';
import OrderList from '@/views/orders/OrderList.vue';
import UserList from '@/views/users/UserList.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardOverview
        },
        {
          path: 'products',
          name: 'products',
          component: ProductList
        },
        {
          path: 'orders',
          name: 'orders',
          component: OrderCreate
        },
        {
          path: 'orders/list',
          name: 'orders-list',
          component: OrderList
        },
        {
          path: 'users',
          name: 'users',
          component: UserList
        },
        {
          path: '',
          redirect: 'dashboard'
        }
      ]
    }
  ]
});

// Guard de Navegación
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
