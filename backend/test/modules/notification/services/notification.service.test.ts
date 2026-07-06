import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { NotificationRepository } from '../../../../src/modules/notification/repositories'
import { NotificationService } from '../../../../src/modules/notification/services'

describe('NotificationService', () => {
  afterEach(() => {
    mock.restore()
  })

  it('creates default settings when the user has no notification settings yet', async () => {
    spyOn(NotificationRepository, 'findUserById').mockResolvedValue({ id: 'user-1' })
    spyOn(NotificationRepository, 'findSettings').mockResolvedValue(null)
    const saveSettingsSpy = spyOn(NotificationRepository, 'saveSettings').mockResolvedValue({
      userId: 'user-1',
      emailEnabled: false,
      pushEnabled: false,
      isMuted: false,
      updatedAt: '2026-07-04T00:00:00.000Z',
    })

    const result = await NotificationService.getSettings('user-1')

    expect(saveSettingsSpy).toHaveBeenCalledWith('user-1', {})
    expect(result).toEqual({
      userId: 'user-1',
      emailEnabled: false,
      pushEnabled: false,
      isMuted: false,
      updatedAt: '2026-07-04T00:00:00.000Z',
    })
  })

  it('throws when updating settings for a missing user', async () => {
    spyOn(NotificationRepository, 'findUserById').mockImplementation(async () => null as any)

    await expect(
      NotificationService.updateSettings('missing-user', {
        isMuted: true,
      }),
    ).rejects.toMatchObject({
      code: 404,
      response: 'User not found',
    })
  })

  it('records notifications with the repository once the user exists', async () => {
    spyOn(NotificationRepository, 'findUserById').mockResolvedValue({ id: 'user-1' })
    const createLogSpy = spyOn(NotificationRepository, 'createLog').mockResolvedValue({
      id: 'log-1',
      userId: 'user-1',
      channel: 'IN_APP',
      type: 'SYSTEM_NOTICE',
      title: 'Welcome',
      message: 'Hello there',
      createdAt: '2026-07-04T00:00:00.000Z',
    })

    const result = await NotificationService.recordNotification({
      userId: 'user-1',
      type: 'SYSTEM_NOTICE',
      title: 'Welcome',
      message: 'Hello there',
    })

    expect(createLogSpy).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'SYSTEM_NOTICE',
      title: 'Welcome',
      message: 'Hello there',
    })
    expect(result.id).toBe('log-1')
  })
})
