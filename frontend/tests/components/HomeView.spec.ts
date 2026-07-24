import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
  const stubs = {
    Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
    ModeToggle: { template: '<button>Toggle</button>' },
  }

  it('renders the app name', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [],
        stubs,
      },
    })
    expect(wrapper.text()).toContain('AlToke')
  })

  it('renders main headline', () => {
    const wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('Completa tareas')
    expect(wrapper.text()).toContain('Sube de nivel')
    expect(wrapper.text()).toContain('Domina tu día')
  })

  it('renders CTA buttons', () => {
    const wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('Comenzar gratis')
    expect(wrapper.text()).toContain('Ver funcionamiento')
  })

  it('renders feature cards', () => {
    const wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('Ultra Rápido')
    expect(wrapper.text()).toContain('Gamificación')
    expect(wrapper.text()).toContain('Seguro y Privado')
  })

  it('renders feature descriptions', () => {
    const wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('Diseñado para velocidad extrema')
    expect(wrapper.text()).toContain('Cada tarea te otorga XP')
    expect(wrapper.text()).toContain('Tu información está protegida')
  })

  it('renders header buttons', () => {
    const wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('Iniciar sesión')
    expect(wrapper.text()).toContain('Empezar ahora')
  })

  it('navigates to login on button click', async () => {
    const wrapper = mount(HomeView, { global: { stubs } })
    const buttons = wrapper.findAll('button')
    const startBtn = buttons.find((b) => b.text().includes('Empezar ahora'))
    expect(startBtn).toBeTruthy()
  })
})
