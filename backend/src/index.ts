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
import { TaskService } from './modules/task/service'
import { tagRoutes } from './modules/tag'
import { friendshipRoutes } from './modules/friendship'
import { checkDueTasks } from './modules/notification'
import { adminController } from './modules/admin'

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
      .use(aiModule)
      .use(friendshipRoutes)
      .use(adminController),
  )

export type App = typeof app

if (import.meta.main) {
  const server = app.listen(serverConfig)

  console.log(`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`)

  const runCleanup = async () => {
    try {
      const count = await TaskService.permanentlyDeleteOld()
      if (count > 0) console.log(`Cleanup: removed ${count} expired trashed task(s)`)
    } catch (e) {
      console.error('Cleanup error:', e)
    }
  }

  runCleanup()
  setInterval(runCleanup, 60 * 60 * 1000)

  const runDueCheck = async () => {
    try {
      const count = await checkDueTasks()
      if (count > 0) console.log(`Notifications: ${count} due-task notification(s) sent`)
    } catch (e) {
      console.error('Due task check error:', e)
    }
  }

  runDueCheck()
  setInterval(runDueCheck, 30 * 1000)
}
