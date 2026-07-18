import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { GamificationService } from '../../../../src/modules/gamification/services'
import { GamificationRepository } from '../../../../src/modules/gamification/repositories'
import { FriendshipRepository } from '../../../../src/modules/friendship/repositories/friendship.repository'
import type { UserStats, Achievement } from '../../../../src/modules/gamification/domain/entities'

const repo = (GamificationService as unknown as { repo: GamificationRepository }).repo

const makeUserStats = (overrides: Partial<UserStats> = {}): UserStats => ({
  userId: 'user-1',
  currentLevel: 1,
  totalXp: 0,
  streakCount: 0,
  maxStreak: 0,
  streakFrozenUntil: null,
  overdueHighPriorityCount: 0,
  lastActiveDate: null,
  ...overrides,
})

const makeAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
  id: 'ach-1',
  code: 'xp_5',
  title: 'XP Rookie',
  description: 'Reach level 5',
  isSecret: false,
  requiredXp: 500,
  ...overrides,
})

