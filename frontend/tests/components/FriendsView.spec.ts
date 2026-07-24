import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendsView from '@/views/FriendsView.vue'
import { friendshipService } from '@/services/friendship.service'
import { mockFriendshipEntry } from '../fixtures'

vi.mock('@/services/friendship.service', () => ({
  friendshipService: {
    getFriends: vi.fn<() => void>(),
    getPendingRequests: vi.fn<() => void>(),
    sendRequest: vi.fn<() => void>(),
    acceptRequest: vi.fn<() => void>(),
    rejectRequest: vi.fn<() => void>(),
    removeFriend: vi.fn<() => void>(),
    searchUsers: vi.fn<() => void>(),
  },
}))

vi.mock('@/components/UserProfileDialog.vue', () => ({
  default: { name: 'UserProfileDialog', props: ['user'], template: '<div />' },
}))

describe('FriendsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(friendshipService.getFriends as any).mockResolvedValue([])
    ;(friendshipService.getPendingRequests as any).mockResolvedValue([])
  })

  it('renders the title', () => {
    const wrapper = mount(FriendsView, { global: { stubs: {} } })
    expect(wrapper.text()).toContain('Amigos')
  })

  it('renders tabs', () => {
    const wrapper = mount(FriendsView, { global: { stubs: {} } })
    expect(wrapper.text()).toContain('Mis Amigos')
    expect(wrapper.text()).toContain('Solicitudes')
    expect(wrapper.text()).toContain('Añadir')
  })

  it('loads friends on mount', () => {
    mount(FriendsView, { global: { stubs: {} } })
    expect(friendshipService.getFriends).toHaveBeenCalled()
  })

  it('loads pending requests on mount', () => {
    mount(FriendsView, { global: { stubs: {} } })
    expect(friendshipService.getPendingRequests).toHaveBeenCalled()
  })

  it('shows empty state when no friends', async () => {
    ;(friendshipService.getFriends as any).mockResolvedValue([])
    const wrapper = mount(FriendsView, { global: { stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Aún no tienes amigos')
    })
  })

  it('shows friends when available', async () => {
    ;(friendshipService.getFriends as any).mockResolvedValue([mockFriendshipEntry])
    const wrapper = mount(FriendsView, { global: { stubs: {} } })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Player2')
    })
  })
})
