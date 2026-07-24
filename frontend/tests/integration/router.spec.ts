import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Router navigation guards', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  function createTestRouter() {
    return createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/login', name: 'login', component: { template: '<div />' } },
        {
          path: '/app',
          component: { template: '<router-view />' },
          meta: { requiresAuth: true },
          children: [
            { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
            { path: '/tasks', name: 'tasks', component: { template: '<div />' } },
          ],
        },
      ],
    })
  }

  it('redirects unauthenticated user from protected route to login', async () => {
    const router = createTestRouter()
    router.beforeEach((to, _from, next) => {
      const store = useAuthStore()
      if (to.matched.some((r) => r.meta.requiresAuth) && !store.token) {
        next({ name: 'login' })
      } else {
        next()
      }
    })
    await router.push('/dashboard')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('allows authenticated user to access protected route', async () => {
    const router = createTestRouter()
    const store = useAuthStore()
    store.setAuth(
      { id: '1', email: 'test@test.com', nickname: 'Test' },
      {
        id: '1',
        role: 'USER',
        xp: 0,
        level: 1,
        currentStreak: 0,
        maxStreak: 0,
        nickname: 'Test',
        email: 'test@test.com',
      },
      'valid-token',
    )

    router.beforeEach((to, _from, next) => {
      const s = useAuthStore()
      if (to.matched.some((r) => r.meta.requiresAuth) && !s.token) {
        next({ name: 'login' })
      } else {
        next()
      }
    })

    await router.push('/dashboard')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('redirects authenticated user from login to dashboard', async () => {
    const router = createTestRouter()
    const store = useAuthStore()
    store.setAuth(
      { id: '1', email: 'test@test.com', nickname: 'Test' },
      {
        id: '1',
        role: 'USER',
        xp: 0,
        level: 1,
        currentStreak: 0,
        maxStreak: 0,
        nickname: 'Test',
        email: 'test@test.com',
      },
      'valid-token',
    )

    router.beforeEach((to, _from, next) => {
      const s = useAuthStore()
      if ((to.name === 'login' || to.name === 'home') && s.token) {
        next({ name: 'dashboard' })
      } else {
        next()
      }
    })

    await router.push('/login')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('allows unauthenticated user to access home', async () => {
    const router = createTestRouter()
    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('allows unauthenticated user to access login', async () => {
    const router = createTestRouter()
    await router.push('/login')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('login')
  })
})
