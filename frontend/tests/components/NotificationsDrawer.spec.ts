import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationsDrawer from '@/components/NotificationsDrawer.vue'
import { notificationService } from '@/services/notification.service'
import { mockNotificationLog } from '../fixtures'

vi.mock('@/services/notification.service', () => ({
  notificationService: {
    getHistory: vi.fn(),
  },
}))

describe('NotificationsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(notificationService.getHistory as any).mockResolvedValue([])
  })

  it('renders bell icon', () => {
    const wrapper = mount(NotificationsDrawer, {
      global: {
        stubs: {
          Sheet: { template: '<div><slot /><slot name="default" /></div>', props: ['open'] },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          SheetTrigger: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Badge: { template: '<span><slot /></span>' },
          ScrollArea: { template: '<div><slot /></div>' },
        },
      },
    })
    expect(wrapper.text()).toContain('Notificaciones')
  })

  it('loads history on mount', () => {
    mount(NotificationsDrawer, {
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>', props: ['open'] },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          SheetTrigger: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Badge: { template: '<span><slot /></span>' },
          ScrollArea: { template: '<div><slot /></div>' },
        },
      },
    })
    expect(notificationService.getHistory).toHaveBeenCalled()
  })

  it('shows empty state when no notifications', async () => {
    ;(notificationService.getHistory as any).mockResolvedValue([])
    const wrapper = mount(NotificationsDrawer, {
      global: {
        stubs: {
          Sheet: { template: '<div><slot /><slot name="default" /></div>', props: ['open'] },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          SheetTrigger: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Badge: { template: '<span><slot /></span>' },
          ScrollArea: { template: '<div><slot /></div>' },
        },
      },
    })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No hay notificaciones')
    })
  })
})
