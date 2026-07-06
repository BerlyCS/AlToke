import { db } from '../index'
import { users, privacySettings } from '../schema'
import { password as bunPassword } from 'bun'

export async function seedUsers() {
  console.log('Seeding users...')

  const defaultPassword = await bunPassword.hash('password123')

  const names = [
    'Juan Carlos',
    'Maria Lopez',
    'Carlos Dev',
    'Ana Garcia',
    'Luis Fernandez',
    'Elena Soto',
    'Pedro Martinez',
    'Sofia Ruiz',
    'Miguel Angel',
    'Lucia Ramirez',
  ]

  const usersData = names.map((name) => {
    const firstName = name.split(' ')[0].toLowerCase()
    return {
      email: `${firstName}@altoke.com`,
      passwordHash: defaultPassword,
      nickname: name,
      bio: `Hola, soy ${name} y me encanta organizar mis tareas en AlToke.`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
      xp: Math.floor(Math.random() * 10000),
      level: 1,
      currentStreak: Math.floor(Math.random() * 10),
      maxStreak: Math.floor(Math.random() * 20) + 5,
    }
  })

  usersData.forEach((user) => {
    user.level = Math.max(1, Math.floor(Math.sqrt(user.xp / 25)))
  })

  const createdUsers = await db.insert(users).values(usersData).returning()

  await db.insert(privacySettings).values(
    createdUsers.map((u) => ({
      userId: u.id,
      showLevel: true,
      showStreak: true,
      showAchievements: true,
    })),
  )

  console.log('Users seeded')
  return createdUsers
}
