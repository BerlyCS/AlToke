import { describe, expect, it, beforeAll } from 'bun:test'
import { api, createTestUserAndLogin, isDatabaseAvailable } from '../utils'

const databaseAvailable = await isDatabaseAvailable()

describe.skipIf(!databaseAvailable)('Tag API', () => {
  let token = ''
  let tagId = ''

  beforeAll(async () => {
    const user = await createTestUserAndLogin()
    token = user.token
  })

  it('should create a tag', async () => {
    const { data, error, status } = await api.api.tags.post(
      {
        name: 'Urgent',
        color: 'red',
        icon: 'alert',
      },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    )
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.name).toBe('Urgent')
    tagId = data!.id
  })

  it('should get all tags', async () => {
    const { data, error, status } = await api.api.tags.get({
      headers: { authorization: `Bearer ${token}` },
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    expect(data!.length).toBeGreaterThan(0)
  })

  it('should get a tag by id', async () => {
    const { data, error, status } = await api.api.tags({ id: tagId }).get({
      headers: { authorization: `Bearer ${token}` },
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.name).toBe('Urgent')
  })

  it('should update a tag', async () => {
    const { data, error, status } = await api.api.tags({ id: tagId }).patch(
      {
        name: 'Very Urgent',
      },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    )
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.name).toBe('Very Urgent')
  })

  it('should delete a tag', async () => {
    const { data, error, status } = await api.api.tags({ id: tagId }).delete(undefined as any, {
      headers: { authorization: `Bearer ${token}` },
    })
    expect(status).toBe(200)
    expect(error).toBeNull()
    expect(data?.id).toBe(tagId)

    // Verify it's gone
    const getRes = await api.api.tags({ id: tagId }).get({
      headers: { authorization: `Bearer ${token}` },
    })
    expect(getRes.status).toBe(404)
  })
})
