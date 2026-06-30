import { t, type UnwrapSchema } from "elysia";

export const AuthModel = {
  registerBody: t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6 }),
    nickname: t.Optional(t.String()),
  }),
  loginBody: t.Object({
    email: t.String({ format: "email" }),
    password: t.String(),
  }),
  googleLoginBody: t.Object({
    idToken: t.String(),
  }),
  authResponse: t.Object({
    user: t.Object({
      id: t.String(),
      email: t.String(),
      nickname: t.Union([t.String(), t.Null()]),
      avatarUrl: t.Optional(t.Union([t.String(), t.Null()])),
    }),
    token: t.String(),
  }),
  authError: t.Literal("Invalid credentials"),
  registerError: t.Literal("Email already in use"),
} as const;

export type AuthModel = {
  [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
