import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('counter store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes count to 0', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
  })

  it('doubleCount computes correctly', () => {
    const store = useCounterStore()
    expect(store.doubleCount).toBe(0)
  })

  it('increment increases count', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.count).toBe(1)
  })

  it('doubleCount updates after increment', () => {
    const store = useCounterStore()
    store.increment()
    expect(store.doubleCount).toBe(2)
  })

  it('increment works multiple times', () => {
    const store = useCounterStore()
    store.increment()
    store.increment()
    store.increment()
    expect(store.count).toBe(3)
    expect(store.doubleCount).toBe(6)
  })
})
