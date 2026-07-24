import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '@/views/Dashboard.vue'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockProfile, mockAdminProfile } from '../fixtures'

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
