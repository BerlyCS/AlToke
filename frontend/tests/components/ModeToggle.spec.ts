import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeToggle from '@/components/ModeToggle.vue'

vi.mock('@vueuse/core', () => ({
  useColorMode: vi.fn(() => ({ value: 'light', toggle: vi.fn() })),
}))

describe('ModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a button', () => {
    const wrapper = mount(ModeToggle, {
      global: {
        stubs: {
          Button: { template: '<button><slot /></button>' },
        },
      },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('has sr-only text for accessibility', () => {
    const wrapper = mount(ModeToggle, {
      global: {
        stubs: {
          Button: { template: '<button><slot /></button>' },
        },
      },
    })
    expect(wrapper.text()).toContain('Cambiar tema')
  })

  it('toggles mode on click', async () => {
    const toggleFn = vi.fn()
    const { useColorMode } = await import('@vueuse/core')
    ;(useColorMode as any).mockReturnValue({ value: 'light', toggle: toggleFn })

    const wrapper = mount(ModeToggle, {
      global: {
        stubs: {
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        },
      },
    })

    await wrapper.find('button').trigger('click')
  })
})
