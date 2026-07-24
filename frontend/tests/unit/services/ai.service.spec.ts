import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiResult = vi.fn()
vi.mock('@/services/api', () => {
  const createProxy = (): any =>
    new Proxy(function () {}, {
      get(_, prop) {
        if (prop === 'then') return (r: any, j?: any) => Promise.resolve(mockApiResult()).then(r, j)
        return createProxy()
      },
      apply(_, __, args) {
        mockApiResult(...args)
        return createProxy()
      },
    })
  return {
    api: createProxy(),
    ApiError: class ApiError extends Error {
      status: number
      constructor(status: number, message: string) {
        super(message)
        this.status = status
      }
    },
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ token: 'test-token' }),
}))

describe('aiService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('getSuggestions returns suggestions', async () => {
    const { aiService } = await import('@/services/ai.service')
    const suggestions = { suggestions: [{ id: '1', suggestedTitle: 'Test' }] }
    mockApiResult.mockResolvedValue({ data: suggestions, error: null, status: 200 })
    const result = await aiService.getSuggestions()
    expect(result).toEqual(suggestions)
  })

  it('sendFeedback returns updated suggestion', async () => {
    const { aiService } = await import('@/services/ai.service')
    const suggestion = { id: '1', status: 'ACCEPTED' }
    mockApiResult.mockResolvedValue({ data: suggestion, error: null, status: 200 })
    const result = await aiService.sendFeedback('1', true)
    expect(result).toEqual(suggestion)
  })

  it('predictOverload returns prediction', async () => {
    const { aiService } = await import('@/services/ai.service')
    const prediction = { isOverloaded: true, riskLevel: 'high', explanation: 'Too many tasks' }
    mockApiResult.mockResolvedValue({ data: prediction, error: null, status: 200 })
    const result = await aiService.predictOverload('2024-01-01')
    expect(result).toEqual(prediction)
  })

  it('throws on error', async () => {
    const { aiService } = await import('@/services/ai.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Failed' }, status: 500 })
    await expect(aiService.getSuggestions()).rejects.toThrow()
  })
})
