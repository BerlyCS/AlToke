import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/app',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: '/tasks',
          name: 'tasks',
          component: () => import('../views/TasksView.vue'),
        },
        {
          path: '/configuracion',
          name: 'configuration',
          component: () => import('../views/ConfigurationView.vue'),
        }
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.token) {
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'home') && authStore.token) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
