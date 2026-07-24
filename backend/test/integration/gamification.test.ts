import { describe, expect, it, beforeAll } from 'bun:test'
import { api, createTestUserAndLogin, isDatabaseAvailable } from '../utils'

const databaseAvailable = await isDatabaseAvailable()

describe.skipIf(!databaseAvailable)('Gamification API', () => {
  let token = ''

  beforeAll(async () => {
    const user = await createTestUserAndLogin()
    token = user.token
  })

  it('should fetch global leaderboard', async () => {
    const { data, error, status } = await api.api.gamification.leaderboard.get()
    
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it('should fetch friends leaderboard', async () => {
    const { data, error, status } = await api.api.gamification.leaderboard.friends.get({
      headers: { authorization: `Bearer ${token}` }
    })
    
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    // The user should at least see themselves in the friends leaderboard
    expect(data!.length).toBeGreaterThanOrEqual(1)
  })

  it('should fetch achievements', async () => {
    const { data, error, status } = await api.api.gamification.achievements.get({
      headers: { authorization: `Bearer ${token}` }
    })
    
    expect(status).toBe(200)
    expect(error).toBeNull()
    // It returns an object with achievements array
    expect(Array.isArray(data)).toBe(true)
  })

  it('should fetch inventory', async () => {
    const { data, error, status } = await api.api.gamification.inventory.get({
      headers: { authorization: `Bearer ${token}` }
    })
    
    if (status !== 200) console.log('INVENTORY ERROR:', error)
    expect(status).toBe(200)
    expect(error).toBeNull()
    
    // Returns array of items
    expect(Array.isArray(data)).toBe(true)
  })

  it('should return 404 when using nonexistent item', async () => {
    const { error, status } = await api.api.gamification.inventory.use.post(
      { itemId: '00000000-0000-0000-0000-000000000000' },
      { headers: { authorization: `Bearer ${token}` } }
    )
    
    // Expecting 404 because the user does not have this item
    if (status !== 404) console.log('USE ERROR:', error)
    expect(status).toBe(404)
    expect(error).not.toBeNull()
  })
})
