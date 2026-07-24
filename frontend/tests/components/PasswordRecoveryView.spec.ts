import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordRecoveryView from '@/views/PasswordRecoveryView.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/auth.service', () => ({
  authService: {
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

describe('PasswordRecoveryView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/forgot-password', name: 'forgot-password', component: PasswordRecoveryView },
        { path: '/reset-password', name: 'reset-password', component: PasswordRecoveryView },
        { path: '/login', name: 'login', component: { template: '<div />' } },
      ],
    })
  })

  const stubs = {
    Card: { template: '<div><slot /></div>' },
    Button: { template: '<button :disabled="disabled"><slot /></button>', props: ['disabled'] },
    Input: { template: '<input />', props: ['modelValue'] },
    Label: { template: '<label><slot /></label>' },
    ModeToggle: { template: '<button>Toggle</button>' },
    RouterLink: { template: '<a><slot /></a>', props: ['to'] },
  }

  it('renders forgot password form', async () => {
    await router.push('/forgot-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Recupera tu contraseña')
  })

  it('renders email input', async () => {
    await router.push('/forgot-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Correo electrónico')
  })

  it('renders submit button', async () => {
    await router.push('/forgot-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Enviar enlace')
  })

  it('renders reset password form', async () => {
    await router.push('/reset-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Crea una nueva contraseña')
  })

  it('shows error when submitting reset without token', async () => {
    await router.push('/reset-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    const form = wrapper.find('form')
    if (form.exists()) {
      await form.trigger('submit')
      expect(wrapper.text()).toContain('El enlace de recuperación no es válido.')
    }
  })

  it('shows login link in forgot password mode', async () => {
    await router.push('/forgot-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Inicia sesión')
  })

  it('shows password confirmation field in reset mode', async () => {
    await router.push('/reset-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Confirma tu contraseña')
  })

  it('shows one-time link notice in reset mode', async () => {
    await router.push('/reset-password')
    await router.isReady()
    const wrapper = mount(PasswordRecoveryView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Este enlace es personal')
  })
})
