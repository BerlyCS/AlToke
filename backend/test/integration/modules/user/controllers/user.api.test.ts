import { describe, expect, it, beforeAll } from 'bun:test'
import { api, createTestUserAndLogin, isDatabaseAvailable } from '../../../../utils'

const databaseAvailable = await isDatabaseAvailable()

describe.skipIf(!databaseAvailable)('User Profile API', () => {
  let token = ''
  let userEmail = ''

  beforeAll(async () => {
    const user = await createTestUserAndLogin()
    token = user.token
    userEmail = user.email
  })

  it('should get user profile', async () => {
    const { data, error, status } = await api.api.users.me.get({
      headers: { authorization: `Bearer ${token}` },
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.email).toBe(userEmail)
  })

  it('should update user profile', async () => {
    const { data, error, status } = await api.api.users.me.patch(
      {
        nickname: 'UpdatedNickname',
      },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    )
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.nickname).toBe('UpdatedNickname')
  })
})
