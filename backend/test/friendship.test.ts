import { describe, expect, it } from 'bun:test'
import { api, isDatabaseAvailable, createTestUserAndLogin } from './utils'

const databaseAvailable = await isDatabaseAvailable()

describe.skipIf(!databaseAvailable)('Friendship API', () => {
  it('should send a friendship request', async () => {
    const user1 = await createTestUserAndLogin()
    const user2 = await createTestUserAndLogin()

    const { data, error, status } = await api.api.friendships.request.post(
      { addresseeId: user2.userId },
      { headers: { authorization: `Bearer ${user1.token}` } },
    )

    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.id).toBeDefined()
    expect(data?.status).toBe('PENDING')
  })

  it('should not allow sending a request to oneself', async () => {
    const user = await createTestUserAndLogin()

    const { error, status } = await api.api.friendships.request.post(
      { addresseeId: user.userId },
      { headers: { authorization: `Bearer ${user.token}` } },
    )

    expect(status).toBe(400)
    expect(error).not.toBeNull()
  })

  it('should allow accepting a friendship request', async () => {
    const user1 = await createTestUserAndLogin()
    const user2 = await createTestUserAndLogin()

    // user1 sends request to user2
    const request = await api.api.friendships.request.post(
      { addresseeId: user2.userId },
      { headers: { authorization: `Bearer ${user1.token}` } },
    )

    const friendshipId = request.data?.id!

    // user2 accepts the request
    const { data, error, status } = await api.api.friendships.accept.post(
      { friendshipId },
      { headers: { authorization: `Bearer ${user2.token}` } },
    )

    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.status).toBe('ACCEPTED')
  })

  it('should list friends after accepting', async () => {
    const user1 = await createTestUserAndLogin()
    const user2 = await createTestUserAndLogin()

    const request = await api.api.friendships.request.post(
      { addresseeId: user2.userId },
      { headers: { authorization: `Bearer ${user1.token}` } },
    )

    await api.api.friendships.accept.post(
      { friendshipId: request.data?.id! },
      { headers: { authorization: `Bearer ${user2.token}` } },
    )

    const { data, error, status } = await api.api.friendships[''].get({
      headers: { authorization: `Bearer ${user1.token}` },
    })

    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data).toBeInstanceOf(Array)
    expect(data?.length).toBe(1)
    expect(data?.[0].friend.id).toBe(user2.userId)
  })

  it('should get pending incoming requests', async () => {
    const user1 = await createTestUserAndLogin()
    const user2 = await createTestUserAndLogin()

    await api.api.friendships.request.post(
      { addresseeId: user2.userId },
      { headers: { authorization: `Bearer ${user1.token}` } },
    )

    const { data, error, status } = await api.api.friendships.pending.get({
      headers: { authorization: `Bearer ${user2.token}` },
    })

    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data).toBeInstanceOf(Array)
    expect(data?.length).toBe(1)
    expect(data?.[0].requesterId).toBe(user1.userId)
  })

  it('should search for users excluding oneself', async () => {
    const user1 = await createTestUserAndLogin()

    const { data, error, status } = await api.api.friendships.search.get({
      query: { query: 'test' },
      headers: { authorization: `Bearer ${user1.token}` },
    })

    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data).toBeInstanceOf(Array)
    // Should not contain user1
    const foundUser1 = data?.find(u => u.id === user1.userId)
    expect(foundUser1).toBeUndefined()
  })
})
