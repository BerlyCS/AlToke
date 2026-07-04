import { Elysia, status } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export const authPlugin = (app: Elysia) =>
  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'super-secret',
      }),
    )
    .derive(async ({ jwt, headers }) => {
      const authHeader = headers.authorization
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

      let userId: string | null = null
      if (token) {
        const payload = await jwt.verify(token)
        if (payload && payload.id) {
          userId = payload.id as string
        }
      }

      return {
        userId,
        requireAuth() {
          if (!userId) throw status(401, 'Unauthorized')
          return userId
        },
      }
    })
