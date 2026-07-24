import { mount, type VueWrapper, type MountingOptions } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Component } from 'vue'

export function createTestRouter(routes: any[] = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: { template: '<div />' } },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
      { path: '/forgot-password', name: 'forgot-password', component: { template: '<div />' } },
      { path: '/reset-password', name: 'reset-password', component: { template: '<div />' } },
      { path: '/tasks', name: 'tasks', component: { template: '<div />' } },
      { path: '/calendar', name: 'calendar', component: { template: '<div />' } },
      { path: '/configuracion', name: 'configuration', component: { template: '<div />' } },
      { path: '/ranking', name: 'ranking', component: { template: '<div />' } },
      { path: '/amigos', name: 'friends', component: { template: '<div />' } },
      { path: '/logros', name: 'achievements', component: { template: '<div />' } },
      { path: '/usuarios', name: 'users', component: { template: '<div />' } },
      ...routes,
    ],
  })
}

export async function mountComponent(
  component: Component,
  options: MountingOptions<any> = {},
): Promise<VueWrapper> {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createTestRouter()
  await router.push('/')
  await router.isReady()

  const defaultStubs: Record<string, any> = {
    Button: { template: '<button :disabled="disabled"><slot /></button>', props: ['disabled'] },
    Card: { template: '<div><slot /></div>' },
    CardContent: { template: '<div><slot /></div>' },
    CardHeader: { template: '<div><slot /></div>' },
    CardTitle: { template: '<div><slot /></div>' },
    CardDescription: { template: '<div><slot /></div>' },
    Dialog: { template: '<div v-if="open"><slot /></div>', props: ['open'] },
    DialogContent: { template: '<div><slot /></div>' },
    DialogHeader: { template: '<div><slot /></div>' },
    DialogTitle: { template: '<div><slot /></div>' },
    DialogDescription: { template: '<div><slot /></div>' },
    DialogFooter: { template: '<div><slot /></div>' },
    Badge: { template: '<span><slot /></span>' },
    Input: { template: '<input />' },
    Label: { template: '<label><slot /></label>' },
    Textarea: { template: '<textarea><slot /></textarea>' },
    Progress: {
      template: '<div role="progressbar" :style="{ width: modelValue + \'%\' }"><slot /></div>',
      props: ['modelValue'],
    },
    Avatar: { template: '<div><slot /></div>' },
    AvatarImage: { template: '<img />', props: ['src'] },
    AvatarFallback: { template: '<div><slot /></div>' },
    ScrollArea: { template: '<div><slot /></div>' },
    Skeleton: { template: '<div><slot /></div>' },
    Sheet: { template: '<div><slot /></div>', props: ['open'] },
    SheetContent: { template: '<div><slot /></div>' },
    SheetHeader: { template: '<div><slot /></div>' },
    SheetTitle: { template: '<div><slot /></div>' },
    SheetTrigger: { template: '<div><slot /></div>' },
    Tabs: { template: '<div><slot /></div>' },
    TabsList: { template: '<div><slot /></div>' },
    TabsTrigger: { template: '<button><slot /></button>' },
    TabsContent: { template: '<div><slot /></div>' },
    Select: { template: '<div><slot /></div>' },
    SelectTrigger: { template: '<div><slot /></div>' },
    SelectValue: { template: '<div><slot /></div>' },
    SelectContent: { template: '<div><slot /></div>' },
    SelectGroup: { template: '<div><slot /></div>' },
    SelectItem: { template: '<div><slot /></div>' },
    Popover: { template: '<div><slot /></div>' },
    PopoverTrigger: { template: '<div><slot /></div>' },
    PopoverContent: { template: '<div><slot /></div>' },
    Calendar: { template: '<div />' },
    Separator: { template: '<div />' },
    SidebarProvider: { template: '<div><slot /></div>' },
    SidebarInset: { template: '<div><slot /></div>' },
    SidebarTrigger: { template: '<button><slot /></button>' },
    Sidebar: { template: '<div><slot /></div>' },
    SidebarContent: { template: '<div><slot /></div>' },
    SidebarGroup: { template: '<div><slot /></div>' },
    SidebarGroupContent: { template: '<div><slot /></div>' },
    SidebarMenu: { template: '<div><slot /></div>' },
    SidebarMenuItem: { template: '<div><slot /></div>' },
    SidebarMenuButton: { template: '<div><slot /></div>' },
    SidebarHeader: { template: '<div><slot /></div>' },
    SidebarFooter: { template: '<div><slot /></div>' },
    Drawer: { template: '<div><slot /></div>' },
    DrawerContent: { template: '<div><slot /></div>' },
    DrawerHeader: { template: '<div><slot /></div>' },
    DrawerTitle: { template: '<div><slot /></div>' },
    DrawerDescription: { template: '<div><slot /></div>' },
    DrawerFooter: { template: '<div><slot /></div>' },
    DrawerClose: { template: '<div><slot /></div>' },
    ModeToggle: { template: '<button>Toggle</button>' },
    Toaster: { template: '<div />' },
    RouterLink: { template: '<a><slot /></a>', props: ['to'] },
    RouterView: { template: '<div />' },
  }

  const mergedStubs = { ...defaultStubs, ...options.global?.stubs }

  const wrapper = mount(component, {
    global: {
      plugins: [pinia, router],
      stubs: mergedStubs,
      ...options.global,
    },
    ...options,
  })

  return wrapper
}
