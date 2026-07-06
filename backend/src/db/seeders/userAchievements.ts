import { db } from '../index'
import { userAchievements } from '../schema'
import type { users } from '../schema'
import type { InferSelectModel } from 'drizzle-orm'

type User = InferSelectModel<typeof users>

export async function seedUserAchievements(createdUsers: User[]) {
  console.log('Seeding user achievements...')

  const allAchievements = await db.query.achievements.findMany()
  if (allAchievements.length === 0) return

  const userAchievementsData = []

  for (const user of createdUsers) {
    const firstLogin = allAchievements.find((a) => a.code === 'first_login')
    if (firstLogin) {
      userAchievementsData.push({
        userId: user.id,
        achievementId: firstLogin.id,
      })
    }

    const firstTask = allAchievements.find((a) => a.code === 'first_task_created')
    if (firstTask) {
      userAchievementsData.push({
        userId: user.id,
        achievementId: firstTask.id,
      })
    }

    const completedTask = allAchievements.find((a) => a.code === 'first_task_completed')
    if (completedTask) {
      userAchievementsData.push({
        userId: user.id,
        achievementId: completedTask.id,
      })
    }

    const tasks10 = allAchievements.find((a) => a.code === 'tasks_10')
    if (tasks10 && Math.random() > 0.5) {
      userAchievementsData.push({
        userId: user.id,
        achievementId: tasks10.id,
      })
    }
  }

  await db.insert(userAchievements).values(userAchievementsData)
  console.log('User achievements seeded')
}
