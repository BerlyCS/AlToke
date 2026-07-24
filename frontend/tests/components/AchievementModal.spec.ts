import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AchievementModal from '@/components/AchievementModal.vue'
import { isAchievementModalOpen, currentAchievement } from '@/composables/useGamification'
import { mockAchievement } from '../fixtures'

vi.mock('@/composables/useGamification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/useGamification')>()
  return {
    ...actual,
    isAchievementModalOpen: actual.isAchievementModalOpen,
    currentAchievement: actual.currentAchievement,
    processAchievementsQueue: vi.fn(),
  }
})

describe('AchievementModal', () => {
  beforeEach(() => {
    isAchievementModalOpen.value = false
    currentAchievement.value = null
    vi.clearAllMocks()
  })

  it('does not render when closed', () => {
    const wrapper = mount(AchievementModal)
    expect(wrapper.text()).not.toContain('Logro Desbloqueado')
  })

  it('renders when open with achievement', () => {
    isAchievementModalOpen.value = true
    currentAchievement.value = { ...mockAchievement }
    const wrapper = mount(AchievementModal)
    expect(wrapper.text()).toContain('Logro Desbloqueado')
  })

  it('displays achievement title', () => {
    isAchievementModalOpen.value = true
    currentAchievement.value = { ...mockAchievement }
    const wrapper = mount(AchievementModal)
    expect(wrapper.text()).toContain('Primera Tarea')
  })

  it('displays achievement description', () => {
    isAchievementModalOpen.value = true
    currentAchievement.value = { ...mockAchievement }
    const wrapper = mount(AchievementModal)
    expect(wrapper.text()).toContain('Completaste tu primera tarea')
  })

  it('renders Genial button', () => {
    isAchievementModalOpen.value = true
    currentAchievement.value = { ...mockAchievement }
    const wrapper = mount(AchievementModal)
    expect(wrapper.text()).toContain('Genial')
  })
})
