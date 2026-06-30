import { Elysia } from 'elysia'
import { serverConfig } from './config'
import { gamificationModule } from './modules/gamification'

export const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .use(gamificationModule)

if (import.meta.main) {
  const server = app.listen(serverConfig)

  console.log(`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`)
}
