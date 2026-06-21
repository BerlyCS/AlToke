import { describe, expect, it } from 'bun:test'

import { resolveServerConfig, serverConfig } from '../src/config'
import { app } from '../src/index'

describe('app', () => {
  it('responds on the root route', async () => {
    const response = await app.handle(new Request('http://localhost/'))

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('Hello Elysia')
  })

  it('uses container-friendly defaults when env vars are missing', () => {
    expect(resolveServerConfig({} as NodeJS.ProcessEnv)).toEqual({
      hostname: '0.0.0.0',
      port: 3000,
    })
  })

  it('uses PORT from the environment when provided', () => {
    expect(resolveServerConfig({ PORT: '8080' } as NodeJS.ProcessEnv)).toEqual({
      hostname: '0.0.0.0',
      port: 8080,
    })
  })

  it('falls back to the default port when PORT is invalid', () => {
    expect(
      resolveServerConfig({ PORT: 'invalid', HOST: '127.0.0.1' } as NodeJS.ProcessEnv),
    ).toEqual({
      hostname: '127.0.0.1',
      port: 3000,
    })
  })

  it('exposes a resolved server config object for startup', () => {
    expect(serverConfig).toEqual(resolveServerConfig())
  })
})
