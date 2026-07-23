import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { Elysia, status } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { NotificationService } from '../../../../../src/modules/notification/services'

process.env.JWT_SECRET = 'test-jwt-secret'
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/altoke'

const getJwtSecret = async () => {
  const module = await import('../../../../../src/shared/auth/jwt-secret')
  return module.resolveJwtSecret()
}

const getNotificationRoutes = async () => {
  const module = await import('../../../../../src/modules/notification')
  return module.notificationRoutes
}

const createToken = async (userId: string) => {
  let token = ''

  // El helper firma tokens con el mismo secreto exigido por las rutas reales,
  // evitando tests que pasen gracias a dobles de autenticación irreales.
  const signer = new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret: await getJwtSecret(),
      }),
    )
    .get('/sign', async ({ jwt }) => {
      token = await jwt.sign({ id: userId })
      return token
    })

  await signer.handle(new Request('http://localhost/sign'))

  return token
}

describe('notificationRoutes', () => {
  afterEach(() => {
    mock.restore()
  })

  it('rejects unauthenticated settings access', async () => {
    const notificationRoutes = await getNotificationRoutes()
    const response = await notificationRoutes.handle(
      new Request('http://localhost/notifications/settings'),
    )

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('returns notification settings for an authenticated user', async () => {
    spyOn(NotificationService, 'getSettings').mockResolvedValue({
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: false,
      isMuted: false,
      updatedAt: '2026-07-04T00:00:00.000Z',
    })

    const notificationRoutes = await getNotificationRoutes()
    const token = await createToken('user-1')
    const response = await notificationRoutes.handle(
      new Request('http://localhost/notifications/settings', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: false,
      isMuted: false,
      updatedAt: '2026-07-04T00:00:00.000Z',
    })
  })

  it('updates notification settings for an authenticated user', async () => {
    spyOn(NotificationService, 'updateSettings').mockResolvedValue({
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: true,
      isMuted: true,
      updatedAt: '2026-07-04T00:00:00.000Z',
    })

    const notificationRoutes = await getNotificationRoutes()
    const token = await createToken('user-1')
    const response = await notificationRoutes.handle(
      new Request('http://localhost/notifications/settings', {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ isMuted: true }),
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      userId: 'user-1',
      emailEnabled: true,
      pushEnabled: true,
      isMuted: true,
      updatedAt: '2026-07-04T00:00:00.000Z',
    })
  })

  it('returns notification history for an authenticated user', async () => {
    spyOn(NotificationService, 'getHistory').mockResolvedValue([
      {
        id: 'log-1',
        userId: 'user-1',
        channel: 'IN_APP',
        type: 'SYSTEM_NOTICE',
        title: 'Welcome',
        message: 'Hello there',
        createdAt: '2026-07-04T00:00:00.000Z',
      },
    ])

    const notificationRoutes = await getNotificationRoutes()
    const token = await createToken('user-1')
    const response = await notificationRoutes.handle(
      new Request('http://localhost/notifications/history?limit=10', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([
      {
        id: 'log-1',
        userId: 'user-1',
        channel: 'IN_APP',
        type: 'SYSTEM_NOTICE',
        title: 'Welcome',
        message: 'Hello there',
        createdAt: '2026-07-04T00:00:00.000Z',
      },
    ])
  })

  it('rejects invalid bearer tokens', async () => {
    const notificationRoutes = await getNotificationRoutes()
    const response = await notificationRoutes.handle(
      new Request('http://localhost/notifications/settings', {
        headers: {
          authorization: 'Bearer not-a-valid-token',
        },
      }),
    )

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('surfaces missing users from the service layer', async () => {
    spyOn(NotificationService, 'getSettings').mockRejectedValue(status(404, 'User not found'))

    const notificationRoutes = await getNotificationRoutes()
    const token = await createToken('missing-user')
    const response = await notificationRoutes.handle(
      new Request('http://localhost/notifications/settings', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    )

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('User not found')
  })

  it('rejects history queries above the validation boundary', async () => {
    const getHistorySpy = spyOn(NotificationService, 'getHistory')
    const notificationRoutes = await getNotificationRoutes()
    const token = await createToken('user-1')
    const response = await notificationRoutes.handle(
      new Request('http://localhost/notifications/history?limit=101', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
    )

    expect(response.status).toBe(422)
    expect(getHistorySpy).not.toHaveBeenCalled()
  })
})
