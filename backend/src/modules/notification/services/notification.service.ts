import { status } from 'elysia'
import type { CreateNotificationInput } from '../domain'
import type { NotificationModel } from '../dto'
import { NotificationRepository } from '../repositories'

const assertUserExists = async (userId: string) => {
  const user = await NotificationRepository.findUserById(userId)

  if (!user) {
    throw status(404, 'User not found' satisfies NotificationModel['userError'])
  }
}

export abstract class NotificationService {
  static async getSettings(userId: string) {
    await assertUserExists(userId)

    const existing = await NotificationRepository.findSettings(userId)
    if (existing) return existing

    // La primera lectura crea el registro con defaults persistidos para que las
    // siguientes actualizaciones trabajen sobre una fila estable.
    return NotificationRepository.saveSettings(userId, {})
  }

  static async updateSettings(userId: string, data: NotificationModel['updateSettingsBody']) {
    await assertUserExists(userId)
    return NotificationRepository.saveSettings(userId, data)
  }

  static async getHistory(userId: string, query: NotificationModel['historyQuery']) {
    await assertUserExists(userId)

    const limit = query.limit ?? 20
    const offset = query.offset ?? 0

    return NotificationRepository.listLogs(userId, limit, offset)
  }

  static async recordNotification(input: CreateNotificationInput) {
    await assertUserExists(input.userId)
    return NotificationRepository.createLog(input)
  }
}
