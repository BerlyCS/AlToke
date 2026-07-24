import { config } from '@vue/test-utils'
import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

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
    success: vi.fn<() => void>(),
    error: vi.fn<() => void>(),
    info: vi.fn<() => void>(),
    warning: vi.fn<() => void>(),
  },
  Toaster: {
    name: 'Toaster',
    template: '<div data-testid="toaster" />',
  },
}))

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn<() => void>(),
}))

// Mock @vueuse/core
vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useColorMode: vi.fn<() => any>(() => ref('light')),
    useMediaQuery: vi.fn<() => any>(() => ref(false)),
  }
})

// Mock @elysiajs/eden
vi.mock('@elysiajs/eden', () => ({
  treaty: vi.fn<() => any>(() => ({})),
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
    has(_target, _prop) {
      return true
    },
  })
})

// Stub global components that are used everywhere
config.global.stubs = {
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to'],
  },
  RouterView: {
    template: '<div />',
  },
  Dialog: {
    template: '<div v-if="open"><slot /></div>',
    props: ['open'],
  },
  DialogContent: {
    template: '<div><slot /></div>',
    props: ['class', 'showCloseButton'],
  },
  DialogHeader: {
    template: '<div><slot /></div>',
  },
  DialogTitle: {
    template: '<div><slot /></div>',
  },
  DialogDescription: {
    template: '<div><slot /></div>',
  },
  DialogFooter: {
    template: '<div><slot /></div>',
  },
  DialogClose: {
    template: '<button><slot /></button>',
  },
  DialogTrigger: {
    template: '<span><slot /></span>',
  },
}

// Global beforeEach to set up a fresh pinia for each test
beforeEach(() => {
  setActivePinia(createPinia())
})
