import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AchievementsView from '@/views/AchievementsView.vue'
import { mockAchievement, mockLockedAchievement, mockSecretAchievement } from '../fixtures'
import { gamificationService } from '@/services/gamification.service'

vi.mock('@/services/gamification.service', () => ({
  gamificationService: {
    getAchievements: vi.fn(),
  },
}))

vi.mock('@/components/AchievementCard.vue', () => ({
  default: {
    name: 'AchievementCard',
    props: ['achievement'],
    template: '<div class="achievement-card">{{ achievement.title }}</div>',
  },
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: {
    name: 'Progress',
    props: ['modelValue'],
    template: '<div role="progressbar" :style="{ width: modelValue + \'%\' }" />',
  },
}))

describe('AchievementsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    ;(gamificationService.getAchievements as any).mockReturnValue(new Promise(() => {}))
    const wrapper = mount(AchievementsView, {
      global: { stubs: {} },
    })
    expect(wrapper.text()).toContain('Logros')
  })

  it('renders achievements after loading', async () => {
    ;(gamificationService.getAchievements as any).mockResolvedValue([
      mockAchievement,
      mockLockedAchievement,
    ])
    const wrapper = mount(AchievementsView, {
      global: { stubs: {} },
    })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Desbloqueados')
      expect(wrapper.text()).toContain('Por descubrir')
    })
  })

  it('shows progress bar', async () => {
    ;(gamificationService.getAchievements as any).mockResolvedValue([mockAchievement])
    const wrapper = mount(AchievementsView, {
      global: { stubs: {} },
    })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Progreso total')
    })
  })

  it('displays correct progress fraction', async () => {
    ;(gamificationService.getAchievements as any).mockResolvedValue([
      mockAchievement,
      mockLockedAchievement,
    ])
    const wrapper = mount(AchievementsView, {
      global: { stubs: {} },
    })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('1 / 2')
    })
  })

  it('shows subtitle description', async () => {
    ;(gamificationService.getAchievements as any).mockResolvedValue([])
    const wrapper = mount(AchievementsView, {
      global: { stubs: {} },
    })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Completa tareas')
    })
  })
})
