import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LevelUpModal from '@/components/LevelUpModal.vue'
import { levelUpData } from '@/composables/useGamification'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))
vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useMediaQuery: vi.fn(() => ({ value: false })),
  }
})
vi.mock('@/composables/useGamification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/useGamification')>()
  return {
    ...actual,
    levelUpData: actual.levelUpData,
    processAchievementsQueue: vi.fn(),
  }
})

describe('LevelUpModal', () => {
  beforeEach(() => {
    levelUpData.value = { open: false, newLevel: 0 }
    vi.clearAllMocks()
  })

  it('does not render when closed', () => {
    const wrapper = mount(LevelUpModal)
    expect(wrapper.text()).not.toContain('Nuevo Nivel')
  })

  it('renders when open with level data', async () => {
    levelUpData.value = { open: true, newLevel: 5, title: 'Test Task', xp: 50 }
    const wrapper = mount(LevelUpModal)
    expect(wrapper.text()).toContain('Nuevo Nivel')
  })

  it('displays the new level number', async () => {
    levelUpData.value = { open: true, newLevel: 5, title: 'Test Task', xp: 50 }
    const wrapper = mount(LevelUpModal)
    expect(wrapper.text()).toContain('5')
  })

  it('displays task title', async () => {
    levelUpData.value = { open: true, newLevel: 5, title: 'My Task', xp: 50 }
    const wrapper = mount(LevelUpModal)
    expect(wrapper.text()).toContain('My Task')
  })

  it('displays XP earned', async () => {
    levelUpData.value = { open: true, newLevel: 5, title: 'Task', xp: 100 }
    const wrapper = mount(LevelUpModal)
    expect(wrapper.text()).toContain('+100')
  })
})
