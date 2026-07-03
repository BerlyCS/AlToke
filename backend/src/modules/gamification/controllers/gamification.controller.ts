import { Elysia, t } from 'elysia'

export const gamificationController = new Elysia({
    prefix: '/gamification',
})
    .get('/leaderboard', () => {
        // TODO: return global leaderboard
        return { message: 'TODO: get leaderboard' }
    })
    .get(
        '/achievements',
        () => {
            // TODO: return unlocked achievements for the provided user
            return { message: 'TODO: get achievements' }
        },
        {
            query: t.Object({
                userId: t.String(),
            }),
        },
    )
    .get(
        '/inventory',
        () => {
            // TODO: return inventory for the provided user
            return { message: 'TODO: get inventory' }
        },
        {
            query: t.Object({
                userId: t.String(),
            }),
        },
    )
    .post(
        '/inventory/use',
        () => {
            // TODO: use item for the provided user
            return { message: 'TODO: use item' }
        },
        {
            body: t.Object({
                userId: t.String(),
                itemId: t.String(),
            }),
        },
    )