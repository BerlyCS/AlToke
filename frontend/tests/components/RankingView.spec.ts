import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RankingView from '@/views/RankingView.vue'
import { gamificationService } from '@/services/gamification.service'
import { mockLeaderboard } from '../fixtures'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/gamification.service', () => ({
  gamificationService: {
    getLeaderboard: vi.fn<() => void>(),
    getFriendsLeaderboard: vi.fn<() => void>(),
  },
}))

vi.mock('@/components/UserProfileDialog.vue', () => ({
  default: { name: 'UserProfileDialog', props: ['user'], template: '<div />' },
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: { name: 'Progress', props: ['modelValue'], template: '<div />' },
}))

describe('RankingView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders the ranking title', () => {
    ;(gamificationService.getLeaderboard as any).mockResolvedValue(mockLeaderboard)
    const wrapper = mount(RankingView, { global: { stubs: {} } })
    expect(wrapper.text()).toContain('Ranking')
  })

  it('shows loading spinner initially', () => {
    ;(gamificationService.getLeaderboard as any).mockReturnValue(new Promise(() => {}))
    const wrapper = mount(RankingView, { global: { stubs: {} } })
    expect(wrapper.html()).toContain('animate-spin')
  })

  it('shows global and friends toggle buttons', () => {
    ;(gamificationService.getLeaderboard as any).mockResolvedValue(mockLeaderboard)
    const wrapper = mount(RankingView, { global: { stubs: {} } })
    expect(wrapper.text()).toContain('Amigos')
    expect(wrapper.text()).toContain('Temporada actual')
  })

  it('shows leaderboard table header', async () => {
    ;(gamificationService.getLeaderboard as any).mockResolvedValue(mockLeaderboard)
    const wrapper = mount(RankingView, { global: { stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Tabla de posiciones')
      expect(wrapper.text()).toContain('Rango')
      expect(wrapper.text()).toContain('Jugador')
      expect(wrapper.text()).toContain('XP')
    })
  })

  it('displays user entries in the table', async () => {
    ;(gamificationService.getLeaderboard as any).mockResolvedValue(mockLeaderboard)
    const wrapper = mount(RankingView, { global: { stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('TestUser')
      expect(wrapper.text()).toContain('Player2')
    })
  })

  it('shows top 3 section', async () => {
    ;(gamificationService.getLeaderboard as any).mockResolvedValue(mockLeaderboard)
    const wrapper = mount(RankingView, { global: { stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Top Jugadores')
    })
  })

  it('shows empty state when no leaderboard', async () => {
    ;(gamificationService.getLeaderboard as any).mockResolvedValue([])
    const wrapper = mount(RankingView, { global: { stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Aún no hay usuarios en el ranking')
    })
  })
})
