import { pgTable, uuid, varchar, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 20 }).default('USER').notNull(),
  nickname: varchar('nickname', { length: 50 }),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  currentStreak: integer('current_streak').default(0),
  maxStreak: integer('max_streak').default(0),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const privacySettings = pgTable('privacy_settings', {
  userId: uuid('user_id')
    .references(() => users.id)
    .primaryKey(),
  showLevel: boolean('show_level').default(true),
  showStreak: boolean('show_streak').default(true),
  showAchievements: boolean('show_achievements').default(true),
})
