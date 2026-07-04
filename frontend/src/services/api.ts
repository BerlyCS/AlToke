import { treaty } from '@elysiajs/eden'
import type { App } from '@backend/index'

// @ts-expect-error Eden types might mismatch depending on setup
export const api = treaty<App>(
  (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api$/, ''),
)

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
