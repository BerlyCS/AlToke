import { t, type UnwrapSchema } from 'elysia'

export const AdminUserPrivacyResponse = t.Object({
	showLevel: t.Union([t.Boolean(), t.Null()]),
	showStreak: t.Union([t.Boolean(), t.Null()]),
	showAchievements: t.Union([t.Boolean(), t.Null()]),
})

export const AdminUserResponse = t.Object({
	id: t.String(),
	email: t.String(),
	role: t.Union([t.Literal('USER'), t.Literal('ADMIN')]),
	nickname: t.Union([t.String(), t.Null()]),
	bio: t.Union([t.String(), t.Null()]),
	avatarUrl: t.Union([t.String(), t.Null()]),
	xp: t.Number(),
	level: t.Union([t.Number(), t.Null()]),
	currentStreak: t.Union([t.Number(), t.Null()]),
	maxStreak: t.Union([t.Number(), t.Null()]),
	lastActiveAt: t.Union([t.Date(), t.Null()]),
	createdAt: t.Date(),
	privacy: t.Union([AdminUserPrivacyResponse, t.Undefined()]),
})

export const AdminUsersResponse = t.Array(AdminUserResponse)

export const UnauthorizedResponse = t.Literal('Unauthorized')
export const ForbiddenResponse = t.Literal('Forbidden')

export type AdminUserPrivacyResponse = UnwrapSchema<typeof AdminUserPrivacyResponse>
export type AdminUserResponse = UnwrapSchema<typeof AdminUserResponse>
export type AdminUsersResponse = UnwrapSchema<typeof AdminUsersResponse>
export type UnauthorizedResponse = UnwrapSchema<typeof UnauthorizedResponse>
export type ForbiddenResponse = UnwrapSchema<typeof ForbiddenResponse>
