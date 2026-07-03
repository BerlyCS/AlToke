import { randomUUID } from 'node:crypto'
import { status } from 'elysia'
import { GamificationRepository } from '../repositories/gamification.repository'
import type {
	Achievement,
	Inventory,
	LeaderboardEntry,
	UnlockedAchievement,
	UseItemResult,
	UserStats,
} from '../domain/entities'

const DAILY_XP_CAP = 500
const XP_PER_LEVEL_STEP = 100

const priorityMultipliers: Record<string, number> = {
	LOW: 1,
	MEDIUM: 1.15,
	HIGH: 1.35,
	URGENT: 1.6,
}

const asDate = (value: Date | string | null | undefined) => {
	if (!value) return null
	return value instanceof Date ? value : new Date(value)
}

const startOfDay = (date: Date) => {
	const value = new Date(date)
	value.setHours(0, 0, 0, 0)
	return value
}

const sameDay = (left: Date, right: Date) => startOfDay(left).getTime() === startOfDay(right).getTime()

const nextDay = (date: Date) => {
	const value = new Date(date)
	value.setDate(value.getDate() + 1)
	return startOfDay(value)
}

const levelFromXp = (xp: number) => Math.max(1, Math.floor(Math.sqrt(xp / XP_PER_LEVEL_STEP)))

const serializeInventory = (inventory: Inventory | null) => inventory

export class GamificationService {
	private static repo = new GamificationRepository()

	static async addXP(
		userId: string,
		xpAmount: number,
		taskPriority: string,
		completedOnTime: boolean,
	): Promise<{ totalXp: number; currentLevel: number; gainedXp: number; leveledUp: boolean }> {
		if (!completedOnTime || xpAmount <= 0) {
			return { totalXp: 0, currentLevel: 0, gainedXp: 0, leveledUp: false }
		}

		const user = await this.repo.findStatsByUserId(userId)
		if (!user) {
			throw status(404, 'User not found')
		}

		const baseXp = Math.round(xpAmount * (priorityMultipliers[taskPriority.toUpperCase()] ?? 1))
		const allowedXp = await this.checkDailyXPLimit(userId, baseXp)
		if (allowedXp <= 0) {
			return { totalXp: user.totalXp, currentLevel: user.currentLevel, gainedXp: 0, leveledUp: false }
		}

		const gainedXp = allowedXp
		const totalXp = user.totalXp + gainedXp
		const currentLevel = levelFromXp(totalXp)
		const leveledUp = currentLevel > user.currentLevel

		await this.repo.saveXPTransaction({
			id: randomUUID(),
			userId,
			amount: gainedXp,
			source: `task:${taskPriority.toLowerCase()}`,
			date: new Date(),
		})

		await this.repo.saveStats({
			...user,
			totalXp,
			currentLevel,
		})

		await this.verifyStreak(userId, new Date())
		await this.triggerAchievement(userId, `xp_${currentLevel}`)

		return { totalXp, currentLevel, gainedXp, leveledUp }
	}

	static async checkDailyXPLimit(userId: string, xpAmount: number): Promise<number> {
		const today = new Date()
		const todayTotal = await this.repo.getDailyXPTotal(userId, today)
		const remaining = DAILY_XP_CAP - todayTotal
		return Math.max(0, Math.min(xpAmount, remaining))
	}

	static async recalculateLevel(userId: string): Promise<void> {
		const user = await this.repo.findStatsByUserId(userId)
		if (!user) {
			throw status(404, 'User not found')
		}

		const currentLevel = levelFromXp(user.totalXp)
		await this.repo.saveStats({
			...user,
			currentLevel,
		})
	}

	static async verifyStreak(userId: string, completionDate: Date): Promise<void> {
		const user = await this.repo.findStatsByUserId(userId)
		if (!user) {
			throw status(404, 'User not found')
		}

		const lastActiveDate = asDate(user.lastActiveDate)
		const frozenUntil = asDate(user.streakFrozenUntil)
		let streakCount = user.streakCount

		if (!lastActiveDate) {
			streakCount = 1
		} else if (sameDay(lastActiveDate, completionDate)) {
			streakCount = user.streakCount
		} else if (completionDate <= nextDay(lastActiveDate)) {
			streakCount = user.streakCount + 1
		} else if (frozenUntil && completionDate <= frozenUntil) {
			streakCount = user.streakCount
		} else {
			streakCount = 1
		}

		await this.repo.saveStats({
			...user,
			streakCount,
			maxStreak: Math.max(user.maxStreak, streakCount),
			lastActiveDate: completionDate,
		})
	}

	static async checkOverdueHighPriorityTasks(userId: string): Promise<void> {
		const user = await this.repo.findStatsByUserId(userId)
		if (!user) {
			throw status(404, 'User not found')
		}

		await this.repo.saveStats(user)
	}

	static async resetStreak(userId: string): Promise<void> {
		const user = await this.repo.findStatsByUserId(userId)
		if (!user) {
			throw status(404, 'User not found')
		}

		await this.repo.saveStats({
			...user,
			streakCount: 0,
			streakFrozenUntil: null,
		})
	}

	static async freezeStreak(userId: string, itemId: string): Promise<void> {
		const user = await this.repo.findStatsByUserId(userId)
		if (!user) {
			throw status(404, 'User not found')
		}

		const item = await this.repo.findItemById(itemId)
		if (!item) {
			throw status(404, 'Item not found')
		}

		await this.repo.saveStats({
			...user,
			streakFrozenUntil: nextDay(new Date()),
		})
	}

	static async triggerAchievement(userId: string, code: string): Promise<void> {
		const achievement = await this.repo.findAchievementByCode(code)
		if (!achievement) {
			return
		}

		const user = await this.repo.findStatsByUserId(userId)
		if (!user) {
			throw status(404, 'User not found')
		}

		if (user.totalXp < achievement.requiredXp) {
			return
		}

		await this.repo.unlockAchievement(userId, achievement.id)
	}

	static async getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
		return await this.repo.getTopUsersByXp(limit)
	}

	static async getFriendsLeaderboard(userId: string): Promise<LeaderboardEntry[]> {
		const friends = await this.repo.getFriendsStats(userId)
		return friends.map((friend, index) => ({
			userId: friend.userId,
			nickname: null,
			avatarUrl: null,
			currentLevel: friend.currentLevel,
			totalXp: friend.totalXp,
			streakCount: friend.streakCount,
			maxStreak: friend.maxStreak,
			rank: index + 1,
		}))
	}

	static async getUnlockedAchievements(userId: string): Promise<Array<Achievement & { unlockedAt: string }>> {
		return (await this.repo.findUnlockedAchievements(userId)).map((entry) => ({
			...entry.achievement,
			unlockedAt: entry.unlockedAt.toISOString(),
		}))
	}

	static async getInventory(userId: string) {
		const inventory = await this.repo.findInventoryByUserId(userId)
		return inventory?.items ?? []
	}

	static async useItem(userId: string, itemId: string): Promise<UseItemResult> {
		const item = await this.repo.findItemById(itemId)
		if (!item) {
			throw status(404, 'Item not found')
		}

		const consumed = await this.repo.consumeInventoryItem(userId, itemId)
		if (!consumed) {
			throw status(404, 'Item not found in inventory')
		}

		if (typeof item.effect === 'string' && item.effect.toUpperCase().includes('FREEZE')) {
			await this.freezeStreak(userId, itemId)
		}

		return consumed
	}
}
