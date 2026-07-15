import { Elysia, t } from 'elysia'
import { AdminService } from '../services'
import { authPlugin } from '../../../shared/utils/auth-plugin'
import { BanUserRequest, ModerateProfileRequest } from '../dto'
import { BanUserResponse, ModerateProfileResponse, SystemMetricsResponse } from '../dto'

/**
 * Admin Controller
 * Handles admin panel operations like user management, metrics, and moderation
 */
export const adminController = new Elysia({ prefix: '/admin' })
  .use(authPlugin)
  .get(
    '/metrics',
    async ({ requireAuth }) => {
      const userId = requireAuth()

      return await AdminService.getSystemMetrics()
    },
    {
      detail: {
        tags: ['Admin'],
        description: 'Get system metrics and statistics',
      },
      response: SystemMetricsResponse,
    },
  )

  .get(
    '/users',
    async ({ query, set }) => {
      try {
        const limit = query?.limit ? parseInt(query.limit as string) : 10
        const offset = query?.offset ? parseInt(query.offset as string) : 0

        const result = await AdminService.listUsers(limit, offset)
        set.status = 200
        return {
          status: 200,
          data: result,
        }
      } catch {
        set.status = 500
        return {
          status: 500,
          error: 'Failed to fetch users',
        }
      }
    },
    {
      detail: {
        tags: ['Admin'],
        description: 'List all users with pagination',
      },
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
      response: t.Object({
        status: t.Number(),
        data: t.Optional(t.Any()),
        error: t.Optional(t.String()),
      }),
    },
  )

  .get(
    '/users/:id',
    async ({ params, set }) => {
      try {
        const user = await AdminService.getUserSummary(params.id)
        set.status = 200
        return {
          status: 200,
          data: user,
        }
      } catch {
        set.status = 404
        return {
          status: 404,
          error: 'User not found',
        }
      }
    },
    {
      detail: {
        tags: ['Admin'],
        description: 'Get detailed user information',
      },
      params: t.Object({
        id: t.String({ description: 'User ID' }),
      }),
      response: t.Object({
        status: t.Number(),
        data: t.Optional(t.Any()),
        error: t.Optional(t.String()),
      }),
    },
  )

  .post(
    '/users/:id/ban',
    async ({ params, body, set }) => {
      try {
        const result = await AdminService.banUser(params.id, body as any)
        set.status = 200
        return {
          status: 200,
          data: result,
        }
      } catch (error) {
        const message = (error as Error).message
        set.status = message === 'User not found' ? 404 : 400
        return {
          status: set.status,
          error: message,
        }
      }
    },
    {
      detail: {
        tags: ['Admin'],
        description: 'Ban a user from the system',
      },
      params: t.Object({
        id: t.String({ description: 'User ID' }),
      }),
      body: BanUserRequest,
      response: t.Object({
        status: t.Number(),
        data: t.Optional(BanUserResponse),
        error: t.Optional(t.String()),
      }),
    },
  )

  .post(
    '/users/:id/unban',
    async ({ params, set }) => {
      try {
        const result = await AdminService.unbanUser(params.id)
        set.status = 200
        return {
          status: 200,
          data: result,
        }
      } catch (error) {
        const message = (error as Error).message
        set.status = message === 'User not found' ? 404 : 400
        return {
          status: set.status,
          error: message,
        }
      }
    },
    {
      detail: {
        tags: ['Admin'],
        description: 'Unban a previously banned user',
      },
      params: t.Object({
        id: t.String({ description: 'User ID' }),
      }),
      response: t.Object({
        status: t.Number(),
        data: t.Optional(BanUserResponse),
        error: t.Optional(t.String()),
      }),
    },
  )

  .post(
    '/users/:id/moderate',
    async ({ params, body, set }) => {
      try {
        const result = await AdminService.moderateProfile(params.id, body as any)
        set.status = 200
        return {
          status: 200,
          data: result,
        }
      } catch (error) {
        const message = (error as Error).message
        set.status = message === 'User not found' ? 404 : 400
        return {
          status: set.status,
          error: message,
        }
      }
    },
    {
      detail: {
        tags: ['Admin'],
        description: 'Moderate user profile',
      },
      params: t.Object({
        id: t.String({ description: 'User ID' }),
      }),
      body: ModerateProfileRequest,
      response: t.Object({
        status: t.Number(),
        data: t.Optional(ModerateProfileResponse),
        error: t.Optional(t.String()),
      }),
    },
  )
