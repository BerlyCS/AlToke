import { Elysia } from 'elysia'
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
    .get(
        '/achievements',
        async ({ query }) => {
            return await GamificationService.getUnlockedAchievements(query.userId)
        },
        {
            query: GamificationModel.userIdQuery,
            response: {
                200: GamificationModel.achievementsResponse,
            },
        },
    )
    .get(
        '/inventory',
        async ({ query }) => {
            return (await GamificationService.getInventory(query.userId)) as any
        },
        {
            query: GamificationModel.userIdQuery,
            response: {
                200: GamificationModel.inventoryResponse,
            },
        },
    )
    .post(
        '/inventory/use',
        async ({ body }) => {
            return await GamificationService.useItem(body.userId, body.itemId)
        },
        {
            body: GamificationModel.useItemBody,
            response: {
                200: GamificationModel.useItemResponse,
            },
        },
    )