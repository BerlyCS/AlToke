import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from './db'
import { achievements, items, levelRewards } from './db/schema'

const seedAchievements = [
  {
    code: 'xp_1',
    title: 'Primeros pasos',
    description: 'Alcanza el nivel 1',
    requiredXp: 100,
    isSecret: false,
  },
  {
    code: 'xp_5',
    title: 'Aprendiz',
    description: 'Alcanza el nivel 5',
    requiredXp: 2500,
    isSecret: false,
  },
  {
    code: 'xp_10',
    title: 'Dedicado',
    description: 'Alcanza el nivel 10',
    requiredXp: 10000,
    isSecret: false,
  },
  {
    code: 'xp_20',
    title: 'Experto',
    description: 'Alcanza el nivel 20',
    requiredXp: 40000,
    isSecret: false,
  },
  {
    code: 'xp_30',
    title: 'Maestro',
    description: 'Alcanza el nivel 30',
    requiredXp: 90000,
    isSecret: false,
  },
  {
    code: 'xp_50',
    title: 'Leyenda',
    description: 'Alcanza el nivel 50',
    requiredXp: 250000,
    isSecret: false,
  },
  {
    code: 'streak_7',
    title: 'Racha semanal',
    description: 'Completa tareas 7 días seguidos',
    requiredXp: 0,
    isSecret: false,
  },
  {
    code: 'streak_30',
    title: 'Racha mensual',
    description: 'Completa tareas 30 días seguidos',
    requiredXp: 0,
    isSecret: false,
  },
  {
    code: 'streak_100',
    title: 'Racha implacable',
    description: 'Completa tareas 100 días seguidos',
    requiredXp: 0,
    isSecret: true,
  },
  {
    code: 'tasks_10',
    title: 'Trabajador',
    description: 'Completa 10 tareas',
    requiredXp: 0,
    isSecret: false,
  },
  {
    code: 'tasks_50',
    title: 'Productivo',
    description: 'Completa 50 tareas',
    requiredXp: 0,
    isSecret: false,
  },
  {
    code: 'tasks_100',
    title: 'Imparable',
    description: 'Completa 100 tareas',
    requiredXp: 0,
    isSecret: false,
  },
  {
    code: 'tasks_500',
    title: 'Máquina',
    description: 'Completa 500 tareas',
    requiredXp: 0,
    isSecret: true,
  },
]

const seedItems = [
  {
    code: 'streak_freeze',
    name: 'Congelador de racha',
    itemType: 'consumable',
    effect: 'FREEZE_STREAK',
    assetUrl: null,
  },
  {
    code: 'frame_bronze',
    name: 'Marco de bronce',
    itemType: 'cosmetic',
    effect: 'FRAME_BRONZE',
    assetUrl: null,
  },
  {
    code: 'frame_silver',
    name: 'Marco de plata',
    itemType: 'cosmetic',
    effect: 'FRAME_SILVER',
    assetUrl: null,
  },
  {
    code: 'frame_gold',
    name: 'Marco dorado',
    itemType: 'cosmetic',
    effect: 'FRAME_GOLD',
    assetUrl: null,
  },
]

const seedLevelRewards = [
  { level: 5, itemCode: 'frame_bronze', quantity: 1 },
  { level: 10, itemCode: 'streak_freeze', quantity: 1 },
  { level: 15, itemCode: 'frame_silver', quantity: 1 },
  { level: 20, itemCode: 'streak_freeze', quantity: 2 },
  { level: 25, itemCode: 'frame_gold', quantity: 1 },
  { level: 30, itemCode: 'streak_freeze', quantity: 3 },
]

const getItemId = async (code: string) => {
  const [item] = await db.select().from(items).where(eq(items.code, code)).limit(1)
  return item?.id
}

const seed = async () => {
  console.log('Seeding achievements...')
  for (const a of seedAchievements) {
    await db
      .insert(achievements)
      .values({ id: randomUUID(), ...a })
      .onConflictDoNothing({ target: achievements.code })
  }

  console.log('Seeding items...')
  for (const i of seedItems) {
    await db
      .insert(items)
      .values({ id: randomUUID(), ...i })
      .onConflictDoNothing({ target: items.code })
  }

  console.log('Seeding level rewards...')
  for (const r of seedLevelRewards) {
    const itemId = await getItemId(r.itemCode)
    if (!itemId) {
      console.warn(`Item ${r.itemCode} not found, skipping level reward for level ${r.level}`)
      continue
    }
    await db
      .insert(levelRewards)
      .values({ id: randomUUID(), level: r.level, itemId, quantity: r.quantity })
      .onConflictDoNothing({ target: levelRewards.level })
  }

  console.log('Seed completed!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
