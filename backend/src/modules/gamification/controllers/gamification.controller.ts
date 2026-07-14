import { Elysia } from 'elysia'
import { authPlugin } from '../../../shared/utils/auth-plugin'
import { GamificationModel } from '../dto'
import { GamificationService } from '../services'

export const gamificationController = new Elysia({ prefix: '/gamification' })
  .get(
    '/leaderboard',
    async ({ query }) => {
      return await GamificationService.getGlobalLeaderboard(query.limit ?? 10)
    },
    {
      query: GamificationModel.leaderboardQuery,
      response: {
        200: GamificationModel.leaderboardResponse,
      },
    },
  )
  .use(authPlugin)
  .get(
    '/leaderboard/friends',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await GamificationService.getFriendsLeaderboard(userId)
    },
    {
      response: {
        200: GamificationModel.leaderboardResponse,
      },
    },
  )
  .get(
    '/achievements',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return await GamificationService.getAllAchievements(userId)
    },
    {
      response: {
        200: GamificationModel.achievementsResponse,
      },
    },
  )
  .get(
    '/inventory',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      return (await GamificationService.getInventory(userId)) as any
    },
    {
      response: {
        200: GamificationModel.inventoryResponse,
      },
    },
  )
  .post(
    '/inventory/use',
    async ({ requireAuth, body }) => {
      const userId = requireAuth()
      return await GamificationService.useItem(userId, body.itemId)
    },
    {
      body: GamificationModel.useItemBody,
      response: {
        200: GamificationModel.useItemResponse,
      },
    },
  )
