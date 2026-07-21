import { Elysia, t } from 'elysia'
import { AdminService } from '../services'
import { authPlugin } from '../../../shared/utils/auth-plugin'
import { UsersQueryRequest } from '../dto/requests'
import { UsersResponse, TaskMeticsResponse, TopUsersResponse } from '../dto/responses'
import { ModerateProfileRequest, BanUserResponse, ModerateProfileResponse, SystemMetricsResponse } from '../dto'

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
    async ({ requireAuth, query }) => {
      const userId = requireAuth()
      
      return await AdminService.listUsers(query.limit ?? 10, query.offset ?? 0)
    },
    {
      query: UsersQueryRequest,
      response: UsersResponse,
    }
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
    async ({ requireAuth, params: { id } }) => {
      //const userId = requireAuth()

      return await AdminService.banUser(id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: BanUserResponse,
    },
  )

  .post(
    '/users/:id/unban',
    async ({ requireAuth, params: { id } }) => {
      //const userId = requireAuth()
      
      return await AdminService.unbanUser(id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: BanUserResponse,
    },
  )

  .get(
    '/taskMetrics',
    async ({ requireAuth }) => {
      const userId = requireAuth()

      return await AdminService.getTaskMetrics()
    },
    {
      response: TaskMeticsResponse,
    },
  )

  .get(
    '/topUsers',
    async ({ requireAuth }) => {
      const userId = requireAuth()

      return await AdminService.getTopUsers()
    },
    {
      response: TopUsersResponse,
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
