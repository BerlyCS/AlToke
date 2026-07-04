import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { serverConfig } from './config'
import { authRoutes } from './modules/auth'
import { gamificationModule } from './modules/gamification'
import { notificationRoutes } from './modules/notification'
import { userRoutes } from './modules/user'

export const app = new Elysia()
  // @ts-ignore
  .use(cors())
  .get('/', () => 'API AlToke')
  .group('/api', (app) =>
    app.use(authRoutes).use(userRoutes).use(gamificationModule).use(notificationRoutes),
  )

if (import.meta.main) {
  const server = app.listen(serverConfig)

  console.log(`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`)
}
