import { t, type UnwrapSchema } from "elysia";

export const UserModel = {
  updateProfileBody: t.Object({
    nickname: t.Optional(t.String()),
    bio: t.Optional(t.String()),
    avatarUrl: t.Optional(t.String()),
  }),
  profileResponse: t.Object({
    id: t.String(),
    email: t.String(),
    nickname: t.Union([t.String(), t.Null()]),
    bio: t.Union([t.String(), t.Null()]),
    avatarUrl: t.Union([t.String(), t.Null()]),
    xp: t.Union([t.Number(), t.Null()]),
    level: t.Union([t.Number(), t.Null()]),
    currentStreak: t.Union([t.Number(), t.Null()]),
    maxStreak: t.Union([t.Number(), t.Null()]),
    privacy: t.Union([
      t.Object({
        showLevel: t.Union([t.Boolean(), t.Null()]),
        showStreak: t.Union([t.Boolean(), t.Null()]),
        showAchievements: t.Union([t.Boolean(), t.Null()]),
      }),
      t.Undefined(),
    ]),
  }),
  userError: t.Literal("User not found"),
  unauthorizedError: t.Literal("Unauthorized"),
} as const;

export type UserModel = {
  [k in keyof typeof UserModel]: UnwrapSchema<(typeof UserModel)[k]>;
};
