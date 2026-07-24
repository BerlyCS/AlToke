import { config } from '@vue/test-utils'
import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { ref } from 'vue'

// Ensure localStorage is available in jsdom
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {}
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k])
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage
}

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: {
    name: 'Toaster',
    template: '<div data-testid="toaster" />',
  },
}))

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

// Mock @vueuse/core
vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useColorMode: vi.fn(() => ref('light')),
    useMediaQuery: vi.fn(() => ref(false)),
  }
})

// Mock @elysiajs/eden
vi.mock('@elysiajs/eden', () => ({
  treaty: vi.fn(() => ({})),
}))

// Mock lucide-vue-next icons as simple Vue stubs
vi.mock('lucide-vue-next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-vue-next')>()
  const stub = (name: string) => ({
    name,
    render() {
      return null
    },
  })
  const mock: Record<string, any> = {}
  for (const key of Object.keys(actual)) {
    const val = (actual as Record<string, any>)[key]
    if (typeof val === 'function' && val.prototype?.constructor === val) {
      mock[key] = stub(key)
    } else if (typeof val === 'function') {
      mock[key] = stub(key)
    } else {
      mock[key] = val
    }
  }
  return new Proxy(mock, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver)
      if (typeof prop === 'symbol') return undefined
      return stub(String(prop))
    },
    has(target, prop) {
      return true
    },
  })
})
