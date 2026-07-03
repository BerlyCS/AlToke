import { Elysia } from 'elysia'
import { AuthService } from './service'
import { AuthModel } from './model'
import { jwt } from '@elysiajs/jwt'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'super-secret',
    }),
  )
  .post(
    '/register',
    async ({ body, jwt }) => {
      const user = await AuthService.register(body)
      const token = await jwt.sign({ id: user.id })
      return { user, token }
    },
    {
      body: AuthModel.registerBody,
      response: {
        200: AuthModel.authResponse,
        400: AuthModel.registerError,
      },
    },
  )
  .post(
    '/login',
    async ({ body, jwt }) => {
      const user = await AuthService.login(body)
      const token = await jwt.sign({ id: user.id })
      return { user, token }
    },
    {
      body: AuthModel.loginBody,
      response: {
        200: AuthModel.authResponse,
        401: AuthModel.authError,
      },
    },
  )
  .post(
    '/google',
    async ({ body, jwt }) => {
      const user = await AuthService.googleLogin(body)
      const token = await jwt.sign({ id: user.id })
      return { user, token }
    },
    {
      body: AuthModel.googleLoginBody,
      response: {
        200: AuthModel.authResponse,
        401: AuthModel.authError,
      },
    },
  )
