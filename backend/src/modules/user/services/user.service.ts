import { status } from 'elysia'
import type { PublicUserProfile } from '../domain'
import type { UserModel } from '../dto'
import { UserRepository } from '../repositories'

const buildPrivacy = (privacy: Awaited<ReturnType<typeof UserRepository.findPrivacySettings>>) => {
	if (!privacy) return undefined

	return {
		showLevel: privacy.showLevel,
		showStreak: privacy.showStreak,
		showAchievements: privacy.showAchievements,
	}
}

const buildSelfProfile = (
	user: NonNullable<Awaited<ReturnType<typeof UserRepository.findById>>>,
	privacy: Awaited<ReturnType<typeof UserRepository.findPrivacySettings>>,
) => ({
	id: user.id,
	email: user.email,
	nickname: user.nickname,
	bio: user.bio,
	avatarUrl: user.avatarUrl,
	xp: user.xp,
	level: user.level,
	currentStreak: user.currentStreak,
	maxStreak: user.maxStreak,
	privacy: buildPrivacy(privacy),
})

const buildPublicProfile = (
	user: NonNullable<Awaited<ReturnType<typeof UserRepository.findById>>>,
	privacy: Awaited<ReturnType<typeof UserRepository.findPrivacySettings>>,
): PublicUserProfile => {
	const showLevel = privacy?.showLevel ?? true
	const showStreak = privacy?.showStreak ?? true

	return {
		id: user.id,
		nickname: user.nickname,
		bio: user.bio,
		avatarUrl: user.avatarUrl,
		xp: user.xp,
		level: showLevel ? user.level : null,
		currentStreak: showStreak ? user.currentStreak : null,
		maxStreak: showStreak ? user.maxStreak : null,
		privacy: buildPrivacy(privacy),
	}
}

export abstract class UserService {
	static async getProfile(userId: string) {
		const user = await UserRepository.findById(userId)
		if (!user) {
			throw status(404, 'User not found' satisfies UserModel['userError'])
		}

		const privacy = await UserRepository.findPrivacySettings(userId)
		return buildSelfProfile(user, privacy)
	}

	static async updateProfile(userId: string, data: UserModel['updateProfileBody']) {
		const user = await UserRepository.updateProfile(userId, data)
		if (!user) {
			throw status(404, 'User not found' satisfies UserModel['userError'])
		}

		const privacy = await UserRepository.findPrivacySettings(userId)
		return buildSelfProfile(user, privacy)
	}

	static async updatePrivacySettings(userId: string, config: UserModel['updatePrivacyBody']) {
		const privacy = await UserRepository.updatePrivacySettings(userId, config)
		if (!privacy) {
			throw status(404, 'User not found' satisfies UserModel['userError'])
		}

		const user = await UserRepository.findById(userId)
		if (!user) {
			throw status(404, 'User not found' satisfies UserModel['userError'])
		}

		return buildSelfProfile(user, privacy)
	}

	static async getPublicProfile(userId: string) {
		const user = await UserRepository.findById(userId)
		if (!user) {
			throw status(404, 'User not found' satisfies UserModel['userError'])
		}

		const privacy = await UserRepository.findPrivacySettings(userId)
		return buildPublicProfile(user, privacy)
	}
}
