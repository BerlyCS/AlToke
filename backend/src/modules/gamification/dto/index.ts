import { t, type UnwrapSchema } from 'elysia'

export const LeaderboardEntryResponse = t.Object({
  userId: t.String(),
  nickname: t.Union([t.String(), t.Null()]),
  avatarUrl: t.Union([t.String(), t.Null()]),
  currentLevel: t.Number(),
  totalXp: t.Number(),
  streakCount: t.Number(),
  maxStreak: t.Number(),
  rank: t.Number(),
})

export const AchievementResponse = t.Object({
  id: t.String(),
  code: t.String(),
  title: t.String(),
  description: t.String(),
  isSecret: t.Boolean(),
  requiredXp: t.Number(),
  unlockedAt: t.String(),
})

export const InventoryItemResponse = t.Object({
  id: t.String(),
  code: t.String(),
  name: t.String(),
  itemType: t.String(),
  effect: t.Union([t.String(), t.Null()]),
  assetUrl: t.Union([t.String(), t.Null()]),
  quantity: t.Number(),
  isEquipped: t.Boolean(),
})

export const UseItemBody = t.Object({
  userId: t.String(),
  itemId: t.String(),
})

export const UseItemResponse = t.Object({
  userId: t.String(),
  itemId: t.String(),
  remainingQuantity: t.Number(),
  appliedEffect: t.Union([t.String(), t.Null()]),
})

export const UserIdQuery = t.Object({
  userId: t.String(),
})

export const LeaderboardQuery = t.Object({
  limit: t.Optional(t.Numeric()),
})

export const AchievementListResponse = t.Array(AchievementResponse)
export const InventoryResponse = t.Array(InventoryItemResponse)
export const LeaderboardResponse = t.Array(LeaderboardEntryResponse)

export type LeaderboardEntryResponse = UnwrapSchema<typeof LeaderboardEntryResponse>
export type AchievementResponse = UnwrapSchema<typeof AchievementResponse>
export type InventoryItemResponse = UnwrapSchema<typeof InventoryItemResponse>
export type UseItemBody = UnwrapSchema<typeof UseItemBody>
export type UseItemResponse = UnwrapSchema<typeof UseItemResponse>
export type UserIdQuery = UnwrapSchema<typeof UserIdQuery>
export type LeaderboardQuery = UnwrapSchema<typeof LeaderboardQuery>
export type AchievementListResponse = UnwrapSchema<typeof AchievementListResponse>
export type InventoryResponse = UnwrapSchema<typeof InventoryResponse>
export type LeaderboardResponse = UnwrapSchema<typeof LeaderboardResponse>

export const GamificationModel = {
  leaderboardQuery: LeaderboardQuery,
  userIdQuery: UserIdQuery,
  useItemBody: UseItemBody,
  leaderboardResponse: LeaderboardResponse,
  achievementsResponse: AchievementListResponse,
  inventoryResponse: InventoryResponse,
  useItemResponse: UseItemResponse,
} as const

export type GamificationModel = {
  leaderboardQuery: typeof LeaderboardQuery
  userIdQuery: typeof UserIdQuery
  useItemBody: typeof UseItemBody
  leaderboardResponse: typeof LeaderboardResponse
  achievementsResponse: typeof AchievementListResponse
  inventoryResponse: typeof InventoryResponse
  useItemResponse: typeof UseItemResponse
}
