import { t, type UnwrapSchema } from 'elysia'

export const AuthModel = {
  registerBody: t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 6, maxLength: 128 }),
    nickname: t.Optional(t.String()),
  }),
  loginBody: t.Object({
    email: t.String({ format: 'email' }),
    password: t.String(),
  }),
  googleLoginBody: t.Object({
    idToken: t.String(),
  }),
  forgotPasswordBody: t.Object({
    email: t.String({ format: 'email' }),
  }),
  resetPasswordBody: t.Object({
    token: t.String({ minLength: 43, maxLength: 128 }),
    password: t.String({ minLength: 6, maxLength: 128 }),
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
  authError: t.Literal('Invalid credentials'),
  registerError: t.Literal('Email already in use'),
  forgotPasswordResponse: t.Object({
    message: t.Literal('If an account exists, we sent password instructions.'),
  }),
  resetPasswordResponse: t.Object({
    message: t.Literal('Password updated successfully.'),
  }),
  resetPasswordError: t.Literal('Invalid or expired reset link'),
} as const

export type AuthModel = {
  [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>
}
