import { desc, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { notificationLogs, notificationSettings, users } from '../../../db/schema'
import {
  isNotificationChannel,
  type CreateNotificationInput,
  type NotificationLog,
  type NotificationSettings,
} from '../domain'

type NotificationSettingsRow = typeof notificationSettings.$inferSelect
type NotificationLogRow = typeof notificationLogs.$inferSelect

const assertNotificationChannel = (channel: string) => {
  // La migración 0003 endurece la columna en Postgres, pero mantenemos esta
  // validación para detectar datos heredados o inconsistencias en tests/mocks.
  if (!isNotificationChannel(channel)) {
    throw new Error(`Unexpected notification channel: ${channel}`)
  }

  return channel
}

const toSettingsDomain = (settings: NotificationSettingsRow): NotificationSettings => ({
  userId: settings.userId,
  emailEnabled: settings.emailEnabled ?? false,
  pushEnabled: settings.pushEnabled ?? false,
  isMuted: settings.isMuted ?? false,
  updatedAt: settings.updatedAt.toISOString(),
})

const toLogDomain = (log: NotificationLogRow): NotificationLog => ({
  id: log.id,
  userId: log.userId,
  channel: assertNotificationChannel(log.channel),
  type: log.type,
  title: log.title,
  message: log.message,
  createdAt: log.createdAt.toISOString(),
})

export abstract class NotificationRepository {
  static async findUserById(userId: string) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    return user ?? null
  }

  static async findSettings(userId: string): Promise<NotificationSettings | null> {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1)

    return settings ? toSettingsDomain(settings) : null
  }

  static async saveSettings(
    userId: string,
    data: Partial<Omit<NotificationSettings, 'userId' | 'updatedAt'>>,
  ): Promise<NotificationSettings> {
    // El upsert permite crear la configuración perezosamente en la primera
    // consulta y reutilizar la misma ruta para cambios posteriores.
    const [settings] = await db
      .insert(notificationSettings)
      .values({
        userId,
        ...data,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning()

    return toSettingsDomain(settings)
  }

  static async listLogs(userId: string, limit: number, offset: number): Promise<NotificationLog[]> {
    const rows = await db
      .select()
      .from(notificationLogs)
      .where(eq(notificationLogs.userId, userId))
      .orderBy(desc(notificationLogs.createdAt))
      .limit(limit)
      .offset(offset)

    return rows.map(toLogDomain)
  }

  static async createLog(input: CreateNotificationInput): Promise<NotificationLog> {
    const [log] = await db
      .insert(notificationLogs)
      .values({
        userId: input.userId,
        // El contrato del dominio asume que la ausencia de canal significa una
        // notificación interna; la base y la aplicación deben quedar alineadas.
        channel: input.channel ?? 'IN_APP',
        type: input.type,
        title: input.title,
        message: input.message,
      })
      .returning()

    return toLogDomain(log)
  }
}
