import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AchievementCard from '@/components/AchievementCard.vue'
import { mockAchievement, mockLockedAchievement, mockSecretAchievement } from '../fixtures'

describe('AchievementCard', () => {
  const stubs = {
    Card: { template: '<div><slot /></div>' },
    CardContent: { template: '<div><slot /></div>' },
  }

  it('renders unlocked achievement with title', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockAchievement },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Primera Tarea')
  })

  it('renders unlocked achievement description', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockAchievement },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Completaste tu primera tarea')
  })

  it('renders unlocked date', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockAchievement },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Desbloqueado el')
  })

  it('renders locked achievement with lock icon', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockLockedAchievement },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Racha de 30 días')
    expect(wrapper.text()).toContain('Bloqueado')
  })

  it('renders secret achievement as locked with mystery title', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockSecretAchievement },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Logro Secreto')
    expect(wrapper.text()).toContain('Sigue jugando')
  })

  it('applies grayscale class to locked achievement', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockLockedAchievement },
      global: { stubs },
    })
    expect(wrapper.html()).toContain('grayscale')
  })

  it('applies hover effects to unlocked achievement', () => {
    const wrapper = mount(AchievementCard, {
      props: { achievement: mockAchievement },
      global: { stubs },
    })
    expect(wrapper.html()).toContain('hover:shadow-xl')
    expect(wrapper.html()).toContain('hover:scale-105')
  })
})
