import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

vi.mock('@vueuse/core', () => ({
  useColorMode: vi.fn(() => ({ value: 'light' })),
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn() },
}))

vi.mock('@/components/LevelUpModal.vue', () => ({
  default: { name: 'LevelUpModal', template: '<div data-testid="level-up-modal" />' },
}))

vi.mock('@/components/AchievementModal.vue', () => ({
  default: { name: 'AchievementModal', template: '<div data-testid="achievement-modal" />' },
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: { name: 'Toaster', template: '<div data-testid="toaster" />' },
}))

describe('App.vue', () => {
  it('renders the Toaster component', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })
    expect(wrapper.find('[data-testid="toaster"]').exists()).toBe(true)
  })

  it('renders the LevelUpModal component', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })
    expect(wrapper.find('[data-testid="level-up-modal"]').exists()).toBe(true)
  })

  it('renders the AchievementModal component', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })
    expect(wrapper.find('[data-testid="achievement-modal"]').exists()).toBe(true)
  })

  it('renders router-view', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div data-testid="router-view" />' },
        },
      },
    })
    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
  })
})
