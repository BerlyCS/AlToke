import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

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
  streakFrozenUntil: timestamp('streak_frozen_until'),
  overdueHighPriorityCount: integer('overdue_high_priority_count').default(0),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('password_reset_tokens_user_id_created_at_idx').on(table.userId, table.createdAt),
    index('password_reset_tokens_expires_at_idx').on(table.expiresAt),
  ],
)

export const privacySettings = pgTable('privacy_settings', {
  userId: uuid('user_id')
    .references(() => users.id)
    .primaryKey(),
  showLevel: boolean('show_level').default(true),
  showStreak: boolean('show_streak').default(true),
  showAchievements: boolean('show_achievements').default(true),
})

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).default('TASK').notNull(),
  priority: varchar('priority', { length: 20 }).default('MEDIUM').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  estimatedTime: integer('estimated_time'),
  startDate: timestamp('start_date'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  recurrence: varchar('recurrence', { length: 20 }).default('NONE').notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 20 }),
  icon: varchar('icon', { length: 50 }),
})

export const taskTags = pgTable('task_tags', {
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
})

export const tasksRelations = relations(tasks, ({ many }) => ({
  taskTags: many(taskTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  taskTags: many(taskTags),
}))

export const taskTagsRelations = relations(taskTags, ({ one }) => ({
  task: one(tasks, {
    fields: [taskTags.taskId],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [taskTags.tagId],
    references: [tags.id],
  }),
}))
export const notificationSettings = pgTable('notification_settings', {
  userId: uuid('user_id')
    .references(() => users.id)
    .primaryKey(),
  emailEnabled: boolean('email_enabled').default(false),
  pushEnabled: boolean('push_enabled').default(false),
  isMuted: boolean('is_muted').default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const notificationChannelEnum = pgEnum('notification_channel', [
  'EMAIL',
  'PUSH',
  'IN_APP',
  'SYSTEM',
])

export const notificationLogs = pgTable(
  'notification_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    channel: notificationChannelEnum('channel').default('IN_APP').notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('notification_logs_user_id_created_at_idx').on(table.userId, table.createdAt)],
)

export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  isSecret: boolean('is_secret').default(false).notNull(),
  requiredXp: integer('required_xp').default(0).notNull(),
})

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  achievementId: uuid('achievement_id')
    .references(() => achievements.id)
    .notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
})

export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  itemType: varchar('item_type', { length: 20 }).notNull(),
  effect: varchar('effect', { length: 255 }),
  assetUrl: text('asset_url'),
})

export const levelRewards = pgTable('level_rewards', {
  id: uuid('id').defaultRandom().primaryKey(),
  level: integer('level').notNull().unique(),
  itemId: uuid('item_id')
    .references(() => items.id)
    .notNull(),
  quantity: integer('quantity').default(1).notNull(),
})

export const userInventories = pgTable('user_inventories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  itemId: uuid('item_id')
    .references(() => items.id)
    .notNull(),
  quantity: integer('quantity').default(1).notNull(),
  isEquipped: boolean('is_equipped').default(false).notNull(),
})

export const xpTransactions = pgTable('xp_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  amount: integer('amount').notNull(),
  source: varchar('source', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const aiHabitAnalyses = pgTable('ai_habit_analyses', {
  userId: uuid('user_id')
    .references(() => users.id)
    .primaryKey(),
  frequentTimeSlots: jsonb('frequent_time_slots').default([]).notNull(),
  categoryAffinity: jsonb('category_affinity').default({}).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const taskSuggestions = pgTable('task_suggestions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  suggestedTitle: varchar('suggested_title', { length: 100 }).notNull(),
  suggestedTime: timestamp('suggested_time').notNull(),
  explanation: text('explanation').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const friendshipStatusEnum = pgEnum('friendship_status', ['PENDING', 'ACCEPTED', 'REJECTED'])

export const friendships = pgTable(
  'friendships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    requesterId: uuid('requester_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    addresseeId: uuid('addressee_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    status: friendshipStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('friendships_requester_addressee_idx').on(table.requesterId, table.addresseeId),
    index('friendships_addressee_idx').on(table.addresseeId),
  ],
)

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: 'requestedFriendships',
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: 'receivedFriendships',
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  requestedFriendships: many(friendships, {
    relationName: 'requestedFriendships',
  }),
  receivedFriendships: many(friendships, {
    relationName: 'receivedFriendships',
  }),
}))
