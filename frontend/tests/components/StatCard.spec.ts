import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '@/components/StatCard.vue'
import { Zap } from 'lucide-vue-next'

describe('StatCard', () => {
  const defaultProps = {
    title: 'Total XP',
    value: 500,
    icon: Zap,
    complementInfo: '+12% esta semana',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
  }

  it('renders title', () => {
    const wrapper = mount(StatCard, {
      props: defaultProps,
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    })
    expect(wrapper.text()).toContain('Total XP')
  })

  it('renders value', () => {
    const wrapper = mount(StatCard, {
      props: defaultProps,
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    })
    expect(wrapper.text()).toContain('500')
  })

  it('renders complement info', () => {
    const wrapper = mount(StatCard, {
      props: defaultProps,
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    })
    expect(wrapper.text()).toContain('+12% esta semana')
  })

  it('applies custom bgColor and textColor classes', () => {
    const wrapper = mount(StatCard, {
      props: defaultProps,
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    })
    const iconContainer = wrapper.find('.w-14')
    expect(iconContainer.classes()).toContain('bg-yellow-500/10')
    expect(iconContainer.classes()).toContain('text-yellow-500')
  })

  it('renders with undefined value', () => {
    const wrapper = mount(StatCard, {
      props: { ...defaultProps, value: undefined },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
