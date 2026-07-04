import { t, type UnwrapSchema } from 'elysia'

export const ProfileUpdateBody = t.Object({
  nickname: t.Optional(t.String()),
  bio: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String()),
})

export const PrivacyUpdateBody = t.Object({
  showLevel: t.Optional(t.Boolean()),
  showStreak: t.Optional(t.Boolean()),
  showAchievements: t.Optional(t.Boolean()),
})

export const ProfileParams = t.Object({
  id: t.String(),
})

export type ProfileUpdateBody = UnwrapSchema<typeof ProfileUpdateBody>
export type PrivacyUpdateBody = UnwrapSchema<typeof PrivacyUpdateBody>
export type ProfileParams = UnwrapSchema<typeof ProfileParams>
