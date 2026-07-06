import { Elysia } from 'elysia'
import { authPlugin } from '../../../shared/utils/auth-plugin'
import { AdminService } from '../services'
import { AdminModel } from '../dto'


export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(authPlugin)
  .model(AdminModel)
  .get(
    '/users',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await AdminService.listUsers(userId)
    },
    {
      response: {
        200: AdminModel.adminUsersResponse,
        401: AdminModel.unauthorizedError,
        403: AdminModel.forbiddenError,
      },
    },
  )
