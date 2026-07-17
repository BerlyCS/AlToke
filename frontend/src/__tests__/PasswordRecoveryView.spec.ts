import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import PasswordRecoveryView from '@/views/PasswordRecoveryView.vue'

vi.mock('vue-sonner', () => ({ toast: { success: vi.fn<() => void>() } }))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/forgot-password', name: 'forgot-password', component: PasswordRecoveryView },
    { path: '/reset-password', name: 'reset-password', component: PasswordRecoveryView },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  ],
})

const stubs = {
  Card: { template: '<div><slot /></div>' },
  Button: { template: '<button><slot /></button>' },
  Input: { template: '<input />' },
  Label: { template: '<label><slot /></label>' },
  ModeToggle: { template: '<button>Theme</button>' },
}

describe('PasswordRecoveryView', () => {
  beforeEach(async () => {
    await router.push('/reset-password')
    await router.isReady()
  })

  it('shows a clear error when the reset link has no token', async () => {
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('El enlace de recuperación no es válido.')
  })

  it('renders the generic recovery request flow', async () => {
    await router.push('/forgot-password')
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })

    expect(wrapper.text()).toContain('Recupera tu contraseña')
    expect(wrapper.text()).toContain('Enviar enlace')
  })
})
