import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import * as dbModule from '../../../../../src/db'
import { NotificationRepository } from '../../../../../src/modules/notification/repositories'

describe('NotificationRepository', () => {
  afterEach(() => {
    mock.restore()
  })

  it('maps persisted notification rows back to the domain enum', async () => {
    spyOn(dbModule.db, 'select').mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              offset: async () => [
                {
                  id: 'log-1',
                  userId: 'user-1',
                  channel: 'SYSTEM',
                  type: 'SYSTEM_NOTICE',
                  title: 'Welcome',
                  message: 'Hello there',
                  createdAt: new Date('2026-07-04T00:00:00.000Z'),
                },
              ],
            }),
          }),
        }),
      }),
    } as never)

    const result = await NotificationRepository.listLogs('user-1', 20, 0)

    expect(result).toEqual([
      {
        id: 'log-1',
        userId: 'user-1',
        channel: 'SYSTEM',
        type: 'SYSTEM_NOTICE',
        title: 'Welcome',
        message: 'Hello there',
        createdAt: '2026-07-04T00:00:00.000Z',
      },
    ])
  })

  it('fails loudly when a persisted channel falls outside the domain enum', async () => {
    spyOn(dbModule.db, 'select').mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              offset: async () => [
                {
                  id: 'log-1',
                  userId: 'user-1',
                  channel: 'FAX',
                  type: 'SYSTEM_NOTICE',
                  title: 'Welcome',
                  message: 'Hello there',
                  createdAt: new Date('2026-07-04T00:00:00.000Z'),
                },
              ],
            }),
          }),
        }),
      }),
    } as never)

    await expect(NotificationRepository.listLogs('user-1', 20, 0)).rejects.toThrow(
      'Unexpected notification channel: FAX',
    )
  })

  it('preserves schema defaults on first-write when no booleans are provided', async () => {
    const valuesSpy = mock(() => ({
      onConflictDoUpdate: () => ({
        returning: async () => [
          {
            userId: 'user-1',
            emailEnabled: false,
            pushEnabled: false,
            isMuted: false,
            updatedAt: new Date('2026-07-04T00:00:00.000Z'),
          },
        ],
      }),
    }))

    spyOn(dbModule.db, 'insert').mockReturnValue({
      values: valuesSpy,
    } as never)

    const result = await NotificationRepository.saveSettings('user-1', {})
    const insertedRow = (
      valuesSpy.mock.calls as unknown as Array<[Record<string, unknown>]>
    )?.[0]?.[0]

    expect(valuesSpy).toHaveBeenCalled()
    expect(insertedRow).toMatchObject({
      userId: 'user-1',
    })
    expect(insertedRow).not.toHaveProperty('emailEnabled')
    expect(insertedRow).not.toHaveProperty('pushEnabled')
    expect(insertedRow).not.toHaveProperty('isMuted')
    expect(result).toEqual({
      userId: 'user-1',
      emailEnabled: false,
      pushEnabled: false,
      isMuted: false,
      updatedAt: '2026-07-04T00:00:00.000Z',
    })
  })
})
