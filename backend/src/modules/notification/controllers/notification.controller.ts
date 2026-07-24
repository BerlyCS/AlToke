import { jwt } from '@elysiajs/jwt'
import { Elysia, status } from 'elysia'
import { resolveJwtSecret } from '../../../shared/auth/jwt-secret'
import { NotificationModel } from '../dto'
import { NotificationService } from '../services'

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

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .use(
    jwt({
      name: 'jwt',
      secret: resolveJwtSecret(),
    }),
  )
  .derive(async (context) => {
    // La derivación resuelve el usuario una sola vez por request y deja que cada
    // handler decida si necesita autenticación estricta o puede degradar a 401.
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
    '/settings',
    async ({ requireAuth }) => {
      return NotificationService.getSettings(requireAuth())
    },
    {
      response: {
        200: NotificationModel.settingsResponse,
        401: NotificationModel.unauthorizedError,
        404: NotificationModel.userError,
      },
    },
  )
  .patch(
    '/settings',
    async ({ requireAuth, body }) => {
      return NotificationService.updateSettings(requireAuth(), body)
    },
    {
      body: NotificationModel.updateSettingsBody,
      response: {
        200: NotificationModel.settingsResponse,
        401: NotificationModel.unauthorizedError,
        404: NotificationModel.userError,
      },
    },
  )
  .get(
    '/history',
    async ({ requireAuth, query }) => {
      return NotificationService.getHistory(requireAuth(), query)
    },
    {
      query: NotificationModel.historyQuery,
      response: {
        200: NotificationModel.historyResponse,
        401: NotificationModel.unauthorizedError,
        404: NotificationModel.userError,
      },
    },
  )
  .patch(
    '/:id/read',
    async ({ requireAuth, params }) => {
      const result = await NotificationService.markAsRead(requireAuth(), params.id)
      return { success: result }
    },
    {
      params: NotificationModel.markReadParams,
      response: {
        200: NotificationModel.markReadResponse,
        401: NotificationModel.unauthorizedError,
        404: NotificationModel.userError,
      },
    },
  )
  .patch(
    '/read-all',
    async ({ requireAuth }) => {
      await NotificationService.markAllAsRead(requireAuth())
      return { success: true }
    },
    {
      response: {
        200: NotificationModel.markReadResponse,
        401: NotificationModel.unauthorizedError,
      },
    },
  )
  .get(
    '/unread-count',
    async ({ requireAuth }) => {
      const count = await NotificationService.countUnread(requireAuth())
      return { count }
    },
    {
      response: {
        200: NotificationModel.unreadCountResponse,
        401: NotificationModel.unauthorizedError,
      },
    },
  )
