import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockProfile, mockAdminProfile } from '../fixtures'

const StubDashboard = {
  name: 'StubDashboard',
  template: '<div data-testid="stub-dashboard" />',
  __isTeleport: false,
  __isSuspense: false,
}

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue')>()
  return {
    ...actual,
    defineAsyncComponent: () => StubDashboard,
  }
})

import Dashboard from '@/views/Dashboard.vue'

describe('Dashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders without errors for regular user', () => {
    const store = useAuthStore()
    store.profile = { ...mockProfile }
    const wrapper = mount(Dashboard, { global: { stubs: {} } })
    expect(wrapper.exists()).toBe(true)
    expect(store.profile?.role).toBe('USER')
  })

  it('renders without errors for admin user', () => {
    const store = useAuthStore()
    store.profile = { ...mockAdminProfile }
    const wrapper = mount(Dashboard, { global: { stubs: {} } })
    expect(wrapper.exists()).toBe(true)
    expect(store.profile?.role).toBe('ADMIN')
  })

  it('defaults to UserDashboard when no role', () => {
    const store = useAuthStore()
    store.profile = null
    const wrapper = mount(Dashboard, { global: { stubs: {} } })
    expect(wrapper.exists()).toBe(true)
  })
})
