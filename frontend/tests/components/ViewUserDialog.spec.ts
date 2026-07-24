import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ViewUserDialog from '@/components/ViewUserDialog.vue'
import { mockUserSummary } from '../fixtures'

describe('ViewUserDialog', () => {
  const stubs = {
    Dialog: { template: '<div v-if="open"><slot /></div>', props: ['open'] },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    ScrollArea: { template: '<div><slot /></div>' },
    Avatar: { template: '<div><slot /></div>' },
    AvatarImage: { template: '<img />' },
    AvatarFallback: { template: '<div><slot /></div>' },
  }

  it('renders user nickname', () => {
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: mockUserSummary },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('UserTwo')
  })

  it('renders user email', () => {
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: mockUserSummary },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('user2@altoke.com')
  })

  it('renders user role', () => {
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: mockUserSummary },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('USUARIO')
  })

  it('renders user level', () => {
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: mockUserSummary },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('renders user XP', () => {
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: mockUserSummary },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('300 XP')
  })

  it('does not render when user is null', () => {
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: null },
      global: { stubs },
    })
    expect(wrapper.html()).not.toContain('UserTwo')
  })

  it('renders admin role correctly', () => {
    const adminUser = { ...mockUserSummary, role: 'ADMIN' as const }
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: adminUser },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('ADMINISTRADOR')
  })

  it('renders bio when available', () => {
    const userWithBio = { ...mockUserSummary, bio: 'Test bio content' }
    const wrapper = mount(ViewUserDialog, {
      props: { open: true, user: userWithBio },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Test bio content')
  })
})
