import { describe, expect, it } from 'bun:test'
import { api } from './utils'

describe('App API', () => {
  it('should return health check', async () => {
    const { data, error, status } = await api.get()
    expect(status).toBe(200)
    expect(data).toBe('API AlToke en funcionamiento 🚀')
    expect(error).toBeNull()
  })
})
