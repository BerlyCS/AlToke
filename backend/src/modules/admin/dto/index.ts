import {
  AdminUserResponse,
  AdminUsersResponse,
  ForbiddenResponse,
  UnauthorizedResponse,
} from './responses'

export * from './responses'

export const AdminModel = {
  adminUserResponse: AdminUserResponse,
  adminUsersResponse: AdminUsersResponse,
  unauthorizedError: UnauthorizedResponse,
  forbiddenError: ForbiddenResponse,
} as const
