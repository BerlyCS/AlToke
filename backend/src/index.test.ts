import { describe, expect, it } from 'bun:test'

import { app } from './index'

describe('app', () => {
  it('responds on the root route', async () => {
    const response = await app.handle(new Request('http://localhost/'))

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('Hello Elysia')
  })
})
