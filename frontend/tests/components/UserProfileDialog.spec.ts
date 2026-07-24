import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserProfileDialog from '@/components/UserProfileDialog.vue'
import { mockLeaderboard } from '../fixtures'
import { useAuthStore } from '@/stores/auth'
import { setActivePinia, createPinia } from 'pinia'
import { friendshipService } from '@/services/friendship.service'

vi.mock('@/services/friendship.service', () => ({
  friendshipService: {
    sendRequest: vi.fn<(...args: any[]) => any>(),
  },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn<(...args: any[]) => any>(), error: vi.fn<(...args: any[]) => any>() },
}))

describe('UserProfileDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const user = mockLeaderboard[0]!

  const stubs = {
    Dialog: { template: '<div><slot /><slot name="default" /></div>', props: ['open'] },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    DialogTrigger: { template: '<div><slot /></div>' },
    Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
    Progress: { template: '<div />' },
  }

  it('renders user nickname', () => {
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('TestUser')
  })

  it('shows user level', () => {
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('5')
  })

  it('shows user rank', () => {
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('#1')
  })

  it('shows user XP', () => {
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('500')
  })

  it('shows user streak', () => {
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('7')
  })

  it('shows add friend button for non-current user', () => {
    const store = useAuthStore()
    store.profile = { id: 'other-user' } as any
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Añadir Amigo')
  })

  it('does not show add friend button for current user', () => {
    const store = useAuthStore()
    store.profile = { id: 'user-1' } as any
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    expect(wrapper.text()).not.toContain('Añadir Amigo')
  })

  it('sends friend request', async () => {
    const store = useAuthStore()
    store.profile = { id: 'other-user' } as any
    ;(friendshipService.sendRequest as any).mockResolvedValue({ success: true })
    const wrapper = mount(UserProfileDialog, {
      props: { user },
      global: { stubs },
    })
    const addBtn = wrapper.findAll('button').find((b) => b.text().includes('Añadir'))
    await addBtn?.trigger('click')
    expect(friendshipService.sendRequest).toHaveBeenCalledWith('user-1')
  })
})
