import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UsersView from '@/views/UsersView.vue'
import { adminService } from '@/services/admin.service'
import { mockUsersList } from '../fixtures'
import { useAuthStore } from '@/stores/auth'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/services/admin.service', () => ({
  adminService: {
    getUsers: vi.fn(),
    banUser: vi.fn(),
    unBanUser: vi.fn(),
  },
}))

vi.mock('@/components/ViewUserDialog.vue', () => ({
  default: { name: 'ViewUserDialog', props: ['open', 'user'], template: '<div />' },
}))

describe('UsersView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    localStorage.setItem('token', 'test-token')
    setActivePinia(createPinia())
    const store = useAuthStore()
    store.profile = { id: 'admin-1', role: 'ADMIN' } as any
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/usuarios', name: 'users', component: UsersView },
        { path: '/', name: 'home', component: { template: '<div />' } },
      ],
    })
  })

  it('renders the title', async () => {
    ;(adminService.getUsers as any).mockResolvedValue(mockUsersList)
    await router.push('/usuarios')
    await router.isReady()
    const wrapper = mount(UsersView, { global: { plugins: [router], stubs: {} } })
    expect(wrapper.text()).toContain('Usuarios')
  })

  it('loads users on mount', async () => {
    ;(adminService.getUsers as any).mockResolvedValue(mockUsersList)
    await router.push('/usuarios')
    await router.isReady()
    mount(UsersView, { global: { plugins: [router], stubs: {} } })
    expect(adminService.getUsers).toHaveBeenCalled()
  })

  it('shows search input', async () => {
    ;(adminService.getUsers as any).mockResolvedValue(mockUsersList)
    await router.push('/usuarios')
    await router.isReady()
    const wrapper = mount(UsersView, { global: { plugins: [router], stubs: {} } })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('displays user list', async () => {
    ;(adminService.getUsers as any).mockResolvedValue(mockUsersList)
    await router.push('/usuarios')
    await router.isReady()
    const wrapper = mount(UsersView, { global: { plugins: [router], stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('UserTwo')
    })
  })

  it('shows role badges', async () => {
    ;(adminService.getUsers as any).mockResolvedValue(mockUsersList)
    await router.push('/usuarios')
    await router.isReady()
    const wrapper = mount(UsersView, { global: { plugins: [router], stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('USER')
    })
  })
})
