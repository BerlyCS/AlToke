// Gamification Repository
import { UserStats, XPTransaction, Inventory, UserAchievement, Achievement } from '../domain/entities'

export class GamificationRepository {
	// Persist user stats
	async saveStats(stats: UserStats): Promise<void> {
		// TODO: implement persistence
		return
	}

	async findStatsByUserId(userId: string): Promise<UserStats | null> {
		// TODO: fetch stats
		return null
	}

	async getDailyXPTotal(userId: string, date: Date): Promise<number> {
		// TODO: compute daily XP total
		return 0
	}

	async saveXPTransaction(tx: XPTransaction): Promise<void> {
		// TODO: persist transaction
		return
	}

	async getTopUsersByXp(limit: number): Promise<UserStats[]> {
		// TODO: query top users
		return []
	}

	async getFriendsStats(userId: string): Promise<UserStats[]> {
		// TODO: return friends' stats
		return []
	}

	async findInventoryByUserId(userId: string): Promise<Inventory | null> {
		// TODO: fetch user inventory
		return null
	}

	async unlockAchievement(userId: string, achievementId: string): Promise<void> {
		// TODO: persist unlocked achievement
		return
	}

	async findUnlockedAchievements(userId: string): Promise<UserAchievement[]> {
		// TODO: fetch unlocked achievements
		return []
	}
}
