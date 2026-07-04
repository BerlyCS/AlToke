import {
  boolean,
  integer,
  jsonb,
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

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  assignedBy: uuid('assigned_by').references(() => users.id),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  taskType: varchar('task_type', { length: 20 }).default('TASK').notNull(),
  priority: varchar('priority', { length: 20 }).default('MEDIUM').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  estimatedTimeMinutes: integer('estimated_time_mins').default(0).notNull(),
  startTime: timestamp('start_time'),
  dueDate: timestamp('due_date'),
  completionDate: timestamp('completion_date'),
  deletedAt: timestamp('deleted_at'),
  tags: jsonb('tags').default([]).notNull(),
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
