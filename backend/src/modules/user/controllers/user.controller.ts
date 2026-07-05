import { jwt } from '@elysiajs/jwt'
import { Elysia, status } from 'elysia'
import { resolveJwtSecret } from '../../../shared/auth/jwt-secret'
import { UserModel } from '../model'
import { UserService } from '../service'

type JwtContext = {
  jwt: {
    verify: (token: string) => Promise<unknown>
  }
  headers: Record<string, string | undefined>
}

const getAuthenticatedUserId = async ({ jwt, headers }: JwtContext) => {
  const authHeader = headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    throw status(401, 'Unauthorized')
  }

  const payload = (await jwt.verify(token)) as { id?: string } | false | null
  if (!payload || !payload.id) {
    throw status(401, 'Unauthorized')
  }

  return payload.id
}

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(
    jwt({
      name: 'jwt',
      secret: resolveJwtSecret(),
    }),
  )
  .derive(async (context) => {
    const userId = await getAuthenticatedUserId(context).catch(() => null)

    return {
      userId,
      requireAuth() {
        if (!userId) throw status(401, 'Unauthorized')
        return userId
      },
    }
  })
  .get(
    '/profile',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await UserService.getProfile(userId)
    },
    {
      response: {
        200: UserModel.profileResponse,
        401: UserModel.unauthorizedError,
        404: UserModel.userError,
      },
    },
  )
  .get(
    '/me',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await UserService.getProfile(userId)
    },
    {
      response: {
        200: UserModel.profileResponse,
        401: UserModel.unauthorizedError,
        404: UserModel.userError,
      },
    },
  )
  .patch(
    '/profile',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await UserService.updateProfile(userId, body)
    },
    {
      body: UserModel.updateProfileBody,
      response: {
        200: UserModel.profileResponse,
        401: UserModel.unauthorizedError,
        404: UserModel.userError,
      },
    },
  )
  .patch(
    '/me',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await UserService.updateProfile(userId, body)
    },
    {
      body: UserModel.updateProfileBody,
      response: {
        200: UserModel.profileResponse,
        401: UserModel.unauthorizedError,
        404: UserModel.userError,
      },
    },
  )
  .patch(
    '/profile/privacy',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await UserService.updatePrivacySettings(userId, body)
    },
    {
      body: UserModel.updatePrivacyBody,
      response: {
        200: UserModel.profileResponse,
        401: UserModel.unauthorizedError,
        404: UserModel.userError,
      },
    },
  )
  .get(
    '/profile/:id',
    async ({ params }) => {
      return (await UserService.getPublicProfile(params.id)) as any
    },
    {
      params: UserModel.profileParams,
      response: {
        200: UserModel.publicProfileResponse,
        404: UserModel.userError,
      },
    },
  )
