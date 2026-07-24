import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserDashboard from '@/views/UserDashboard.vue'
import { taskService } from '@/services/task.service'
import { gamificationService } from '@/services/gamification.service'
import { mockTasks, mockLeaderboard } from '../fixtures'
import { useAuthStore } from '@/stores/auth'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/services/task.service', () => ({
  taskService: {
    getAllTasks: vi.fn(),
    completeTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}))

vi.mock('@/services/gamification.service', () => ({
  gamificationService: {
    getLeaderboard: vi.fn(),
  },
}))

vi.mock('@/composables/useGamification', () => ({
  useGamification: () => ({
    showReward: vi.fn(),
  }),
  unlockedAchievementsQueue: { value: [] },
  processAchievementsQueue: vi.fn(),
}))

vi.mock('@/components/CreateTaskDialog.vue', () => ({
  default: { name: 'CreateTaskDialog', template: '<div />' },
}))

vi.mock('@/components/ViewTaskDialog.vue', () => ({
  default: { name: 'ViewTaskDialog', template: '<div />' },
}))

vi.mock('@/components/UpcomingTasks.vue', () => ({
  default: { name: 'UpcomingTasks', template: '<div />' },
}))

vi.mock('@/components/StatCard.vue', () => ({
  default: {
    name: 'StatCard',
    props: ['title', 'value'],
    template: '<div>{{ title }}: {{ value }}</div>',
  },
}))

describe('UserDashboard', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    localStorage.setItem('token', 'test-token')
    setActivePinia(createPinia())
    const store = useAuthStore()
    store.profile = {
      id: 'user-1',
      nickname: 'TestUser',
      xp: 500,
      level: 5,
      currentStreak: 7,
      role: 'USER',
    } as any
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/dashboard', name: 'dashboard', component: UserDashboard },
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/tasks', name: 'tasks', component: { template: '<div />' } },
        { path: '/amigos', name: 'friends', component: { template: '<div />' } },
        { path: '/ranking', name: 'ranking', component: { template: '<div />' } },
        { path: '/logros', name: 'achievements', component: { template: '<div />' } },
      ],
    })
  })

  it('renders greeting', async () => {
    ;(taskService.getAllTasks as any).mockResolvedValue([])
    ;(gamificationService.getLeaderboard as any).mockResolvedValue([])
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(UserDashboard, { global: { plugins: [router], stubs: {} } })
    expect(wrapper.text()).toContain('Hola, TestUser')
  })

  it('shows logout button', async () => {
    ;(taskService.getAllTasks as any).mockResolvedValue([])
    ;(gamificationService.getLeaderboard as any).mockResolvedValue([])
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(UserDashboard, { global: { plugins: [router], stubs: {} } })
    expect(wrapper.text()).toContain('Salir')
  })

  it('shows new task button', async () => {
    ;(taskService.getAllTasks as any).mockResolvedValue([])
    ;(gamificationService.getLeaderboard as any).mockResolvedValue([])
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(UserDashboard, { global: { plugins: [router], stubs: {} } })
    expect(wrapper.text()).toContain('Nueva tarea')
  })

  it('shows streak display', async () => {
    ;(taskService.getAllTasks as any).mockResolvedValue([])
    ;(gamificationService.getLeaderboard as any).mockResolvedValue([])
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(UserDashboard, { global: { plugins: [router], stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Racha actual')
    })
  })

  it('shows quick actions', async () => {
    ;(taskService.getAllTasks as any).mockResolvedValue([])
    ;(gamificationService.getLeaderboard as any).mockResolvedValue([])
    await router.push('/dashboard')
    await router.isReady()
    const wrapper = mount(UserDashboard, { global: { plugins: [router], stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Acciones rápidas')
    })
  })
})
