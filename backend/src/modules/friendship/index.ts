import { Elysia } from 'elysia'
import { authPlugin } from '../../shared/utils/auth-plugin'
import { FriendshipService } from './services/friendship.service'
import { FriendshipModel } from './dto'

export const friendshipRoutes = new Elysia({ prefix: '/friendships' })
  .use(authPlugin)
  .get(
    '/',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return (await FriendshipService.getFriends(userId)) as any
    },
    {
      response: {
        200: FriendshipModel.friendsResponse,
      },
    },
  )
  .get(
    '/pending',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return (await FriendshipService.getPendingRequests(userId)) as any
    },
    {
      response: {
        200: FriendshipModel.pendingRequestsResponse,
      },
    },
  )
  .post(
    '/request',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await FriendshipService.sendRequest(userId, body.addresseeId)
    },
    {
      body: FriendshipModel.sendRequestParams,
    },
  )
  .post(
    '/accept',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await FriendshipService.acceptRequest(userId, body.friendshipId)
    },
    {
      body: FriendshipModel.acceptRequestParams,
    },
  )
  .post(
    '/reject',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await FriendshipService.rejectRequest(userId, body.friendshipId)
    },
    {
      body: FriendshipModel.acceptRequestParams,
    },
  )
  .delete('/:id', async ({ requireAuth, params }) => {
    const userId = requireAuth()
    return await FriendshipService.removeFriend(userId, params.id)
  })
  .get(
    '/search',
    async ({ requireAuth, query }) => {
      const userId = requireAuth()
      return (await FriendshipService.searchUsers(query.query, userId)) as any
    },
    {
      query: FriendshipModel.searchQuery,
      response: {
        200: FriendshipModel.searchUsersResponse,
      },
    },
  )
