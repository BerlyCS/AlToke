import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { serverConfig } from './config'
import { aiModule } from './modules/ai'
import { authRoutes } from './modules/auth'
import { gamificationModule } from './modules/gamification'
import { notificationRoutes } from './modules/notification'
import { userRoutes } from './modules/user'
import { taskRoutes } from './modules/task'
import { tagRoutes } from './modules/tag'

export const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      documentation: {
        info: { title: 'AlToke API', version: '1.0.0' },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    }),
  )
  .get('/', () => 'API AlToke en funcionamiento 🚀')
  .group('/api', (app) =>
    app
      .use(authRoutes)
      .use(userRoutes)
      .use(taskRoutes)
      .use(tagRoutes)
      .use(gamificationModule)
      .use(notificationRoutes)
      .use(aiModule),
  )

export type App = typeof app

if (import.meta.main) {
  const server = app.listen(serverConfig)

  console.log(`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`)
}
