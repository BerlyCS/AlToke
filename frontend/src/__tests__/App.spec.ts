import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts and renders correctly', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div />' },
          RouterLink: { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
