import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { resolveJwtSecret } from '../../shared/auth/jwt-secret'
import { FriendshipService } from './services/friendship.service'
import { FriendshipModel } from './dto'

export const friendshipRoutes = new Elysia({ prefix: '/friendships' })
  .use(
    jwt({
      name: 'jwt',
      secret: resolveJwtSecret(),
    })
  )
  .derive(async ({ jwt, headers }) => {
    const auth = headers['authorization']
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) throw new Error('Unauthorized')
    
    const payload = await jwt.verify(token)
    if (!payload || !payload.id) throw new Error('Unauthorized')
    
    return { userId: payload.id as string }
  })
  .get('/', async ({ userId }) => {
    return await FriendshipService.getFriends(userId)
  })
  .get('/pending', async ({ userId }) => {
    return await FriendshipService.getPendingRequests(userId)
  })
  .post('/request', async ({ userId, body }) => {
    return await FriendshipService.sendRequest(userId, body.addresseeId)
  }, {
    body: FriendshipModel.sendRequestParams
  })
  .post('/accept', async ({ userId, body }) => {
    return await FriendshipService.acceptRequest(userId, body.friendshipId)
  }, {
    body: FriendshipModel.acceptRequestParams
  })
  .post('/reject', async ({ userId, body }) => {
    return await FriendshipService.rejectRequest(userId, body.friendshipId)
  }, {
    body: FriendshipModel.acceptRequestParams
  })
  .delete('/:id', async ({ userId, params }) => {
    return await FriendshipService.removeFriend(userId, params.id)
  })
  .get('/search', async ({ userId, query }) => {
    return await FriendshipService.searchUsers(query.query, userId)
  }, {
    query: FriendshipModel.searchQuery
  })
