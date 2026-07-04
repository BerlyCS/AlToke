import { describe, expect, it } from 'vitest'

import { resolveApiUrl } from './api'

describe('resolveApiUrl', () => {
  it('defaults to the same-origin api path when no override is provided', () => {
    expect(resolveApiUrl({})).toBe('/api')
  })

  it('uses a configured override and trims trailing slashes', () => {
    expect(resolveApiUrl({ VITE_API_URL: 'https://example.com/custom-api/' })).toBe(
      'https://example.com/custom-api',
    )
  })
})
