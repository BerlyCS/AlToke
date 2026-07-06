import { cleanDatabase } from './clean'
import { seedUsers } from './users'
import { seedFriendships } from './friendships'
import { seedTasks } from './tasks'
import { seedAchievements } from './achievements'
import { seedUserAchievements } from './userAchievements'

async function runSeeders() {
  console.log('Starting database seed...')

  try {
    await cleanDatabase()
    await seedAchievements()
    const users = await seedUsers()
    await seedFriendships(users)
    await seedTasks(users)
    await seedUserAchievements(users)

    console.log('All seeds completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}

runSeeders()
