import { t, type UnwrapSchema } from 'elysia'

export const PrivacyResponse = t.Object({
	showLevel: t.Union([t.Boolean(), t.Null()]),
	showStreak: t.Union([t.Boolean(), t.Null()]),
	showAchievements: t.Union([t.Boolean(), t.Null()]),
})

export const ProfileResponse = t.Object({
	id: t.String(),
	email: t.String(),
	nickname: t.Union([t.String(), t.Null()]),
	bio: t.Union([t.String(), t.Null()]),
	avatarUrl: t.Union([t.String(), t.Null()]),
	xp: t.Number(),
	level: t.Union([t.Number(), t.Null()]),
	currentStreak: t.Union([t.Number(), t.Null()]),
	maxStreak: t.Union([t.Number(), t.Null()]),
	privacy: t.Union([PrivacyResponse, t.Undefined()]),
})

export const PublicProfileResponse = t.Object({
	id: t.String(),
	nickname: t.Union([t.String(), t.Null()]),
	bio: t.Union([t.String(), t.Null()]),
	avatarUrl: t.Union([t.String(), t.Null()]),
	xp: t.Number(),
	level: t.Union([t.Number(), t.Null()]),
	currentStreak: t.Union([t.Number(), t.Null()]),
	maxStreak: t.Union([t.Number(), t.Null()]),
	privacy: t.Union([PrivacyResponse, t.Undefined()]),
})

export const UnauthorizedResponse = t.Literal('Unauthorized')
export const UserNotFoundResponse = t.Literal('User not found')

export type PrivacyResponse = UnwrapSchema<typeof PrivacyResponse>
export type ProfileResponse = UnwrapSchema<typeof ProfileResponse>
export type PublicProfileResponse = UnwrapSchema<typeof PublicProfileResponse>
export type UnauthorizedResponse = UnwrapSchema<typeof UnauthorizedResponse>
export type UserNotFoundResponse = UnwrapSchema<typeof UserNotFoundResponse>
