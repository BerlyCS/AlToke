import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminDashboard from '@/views/AdminDashboard.vue'
import { adminService } from '@/services/admin.service'
import {
  mockAdminMetrics,
  mockTaskMetrics,
  mockTopUsers,
  mockPerformanceMetrics,
} from '../fixtures'
import { useAuthStore } from '@/stores/auth'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/services/admin.service', () => ({
  adminService: {
    getMetrics: vi.fn(),
    getTaskMetrics: vi.fn(),
    getTopUsers: vi.fn(),
    getPerformanceMetrics: vi.fn(),
  },
}))

vi.mock('@/components/StatCard.vue', () => ({
  default: {
    name: 'StatCard',
    props: ['title', 'value'],
    template: '<div>{{ title }}: {{ value }}</div>',
  },
}))

describe('AdminDashboard', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    localStorage.setItem('token', 'test-token')
    setActivePinia(createPinia())
    const store = useAuthStore()
    store.profile = { id: 'admin-1', nickname: 'AdminUser', role: 'ADMIN' } as any
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/dashboard', name: 'dashboard', component: AdminDashboard },
        { path: '/', name: 'home', component: { template: '<div />' } },
      ],
    })
  })

  it('renders greeting', async () => {
    ;(adminService.getMetrics as any).mockResolvedValue(mockAdminMetrics)
    ;(adminService.getTaskMetrics as any).mockResolvedValue(mockTaskMetrics)
    ;(adminService.getTopUsers as any).mockResolvedValue(mockTopUsers)
    ;(adminService.getPerformanceMetrics as any).mockResolvedValue(mockPerformanceMetrics)
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AdminDashboard, { global: { plugins: [router], stubs: {} } })
    expect(wrapper.text()).toContain('Hola, AdminUser')
  })

  it('shows logout button', async () => {
    ;(adminService.getMetrics as any).mockResolvedValue(mockAdminMetrics)
    ;(adminService.getTaskMetrics as any).mockResolvedValue(mockTaskMetrics)
    ;(adminService.getTopUsers as any).mockResolvedValue(mockTopUsers)
    ;(adminService.getPerformanceMetrics as any).mockResolvedValue(mockPerformanceMetrics)
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AdminDashboard, { global: { plugins: [router], stubs: {} } })
    expect(wrapper.text()).toContain('Salir')
  })

  it('displays admin metrics', async () => {
    ;(adminService.getMetrics as any).mockResolvedValue(mockAdminMetrics)
    ;(adminService.getTaskMetrics as any).mockResolvedValue(mockTaskMetrics)
    ;(adminService.getTopUsers as any).mockResolvedValue(mockTopUsers)
    ;(adminService.getPerformanceMetrics as any).mockResolvedValue(mockPerformanceMetrics)
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(AdminDashboard, { global: { plugins: [router], stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Usuarios Totales')
      expect(wrapper.text()).toContain('Total de Tareas')
    })
  })

  it('loads metrics on mount', async () => {
    ;(adminService.getMetrics as any).mockResolvedValue(mockAdminMetrics)
    ;(adminService.getTaskMetrics as any).mockResolvedValue(mockTaskMetrics)
    ;(adminService.getTopUsers as any).mockResolvedValue(mockTopUsers)
    ;(adminService.getPerformanceMetrics as any).mockResolvedValue(mockPerformanceMetrics)
    await router.push('/dashboard')
    await router.isReady()
    mount(AdminDashboard, { global: { plugins: [router], stubs: {} } })
    expect(adminService.getMetrics).toHaveBeenCalled()
    expect(adminService.getTaskMetrics).toHaveBeenCalled()
    expect(adminService.getTopUsers).toHaveBeenCalled()
    expect(adminService.getPerformanceMetrics).toHaveBeenCalled()
  })
})
