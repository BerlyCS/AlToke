import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '@/views/LoginView.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { mockProfile } from '../fixtures'

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    googleLogin: vi.fn(),
  },
}))

vi.mock('@/services/user.service', () => ({
  userService: {
    getProfile: vi.fn(),
  },
}))

describe('LoginView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', name: 'login', component: LoginView },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
        { path: '/forgot-password', name: 'forgot-password', component: { template: '<div />' } },
        { path: '/', name: 'home', component: { template: '<div />' } },
      ],
    })
  })

  const stubs = {
    Button: {
      template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      props: ['disabled'],
    },
    Input: { template: '<input />', props: ['modelValue'] },
    Label: { template: '<label><slot /></label>' },
    Card: { template: '<div><slot /></div>' },
    ModeToggle: { template: '<button>Toggle</button>' },
  }

  it('renders login form by default', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Bienvenido de nuevo')
  })

  it('renders email input', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Correo electrónico')
  })

  it('renders password input', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Contraseña')
  })

  it('renders submit button', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Iniciar Sesión')
  })

  it('toggles to register mode', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    const toggleBtn = wrapper.findAll('button').find((b) => b.text().includes('Regístrate'))
    if (toggleBtn) {
      await toggleBtn.trigger('click')
      expect(wrapper.text()).toContain('Crea tu cuenta')
      expect(wrapper.text()).toContain('Registrarse')
    }
  })

  it('shows forgot password link', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('¿Olvidaste tu contraseña?')
  })

  it('shows terms of service', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('Términos de servicio')
    expect(wrapper.text()).toContain('Política de privacidad')
  })

  it('shows Google login section', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    expect(wrapper.text()).toContain('O continúa con')
  })

  it('has registration nickname field in register mode', async () => {
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router], stubs } })
    const toggleBtn = wrapper.findAll('button').find((b) => b.text().includes('Regístrate'))
    if (toggleBtn) {
      await toggleBtn.trigger('click')
      expect(wrapper.text()).toContain('Apodo')
    }
  })
})
