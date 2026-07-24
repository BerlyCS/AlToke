import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiResult = vi.fn<(...args: any[]) => any>()
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

describe('tagService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockApiResult.mockReset()
  })

  it('getAllTags returns tags', async () => {
    const { tagService } = await import('@/services/tag.service')
    const tags = [{ id: '1', name: 'Work' }]
    mockApiResult.mockResolvedValue({ data: tags, error: null, status: 200 })
    const result = await tagService.getAllTags()
    expect(result).toEqual(tags)
  })

  it('createTag returns created tag', async () => {
    const { tagService } = await import('@/services/tag.service')
    const tag = { id: '1', name: 'New' }
    mockApiResult.mockResolvedValue({ data: tag, error: null, status: 201 })
    const result = await tagService.createTag({ name: 'New' })
    expect(result).toEqual(tag)
  })

  it('updateTag returns updated tag', async () => {
    const { tagService } = await import('@/services/tag.service')
    const tag = { id: '1', name: 'Updated' }
    mockApiResult.mockResolvedValue({ data: tag, error: null, status: 200 })
    const result = await tagService.updateTag('1', { name: 'Updated' })
    expect(result).toEqual(tag)
  })

  it('deleteTag returns deleted tag', async () => {
    const { tagService } = await import('@/services/tag.service')
    const tag = { id: '1', name: 'Deleted' }
    mockApiResult.mockResolvedValue({ data: tag, error: null, status: 200 })
    const result = await tagService.deleteTag('1')
    expect(result).toEqual(tag)
  })

  it('throws on error', async () => {
    const { tagService } = await import('@/services/tag.service')
    mockApiResult.mockResolvedValue({ data: null, error: { value: 'Failed' }, status: 500 })
    await expect(tagService.getAllTags()).rejects.toThrow('Failed')
  })
})
