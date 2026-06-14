import { Elysia } from 'elysia'

export const app = new Elysia().get('/', () => 'Hello Elysia')

if (import.meta.main) {
  const server = app.listen(3000)

  console.log(`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`)
}
