import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { password as bunPassword } from 'bun'
import { db } from './db'
import { achievements, items, levelRewards, users, tags, tasks, taskTags, privacySettings } from './db/schema'

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

const SEED_EMAIL = 'test@prueba.com'
const SEED_PASSWORD = '12345678'

const tagDefs = [
  { name: 'Trabajo', color: 'bg-blue-500', icon: 'Briefcase' },
  { name: 'Personal', color: 'bg-purple-500', icon: 'Heart' },
  { name: 'Salud', color: 'bg-green-500', icon: 'Dumbbell' },
  { name: 'Estudio', color: 'bg-yellow-500', icon: 'Book' },
  { name: 'Hogar', color: 'bg-orange-500', icon: 'Home' },
]

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(10, 0, 0, 0)
  return d
}

const getItemId = async (code: string) => {
  const [item] = await db.select().from(items).where(eq(items.code, code)).limit(1)
  return item?.id
}

const seed = async () => {
  try {
    console.log('Seeding achievements...')
    for (const a of seedAchievements) {
      await db
        .insert(achievements)
        .values({ id: randomUUID(), ...a })
        .onConflictDoNothing({ target: achievements.code })
    }
  } catch (e) {
    console.error('Achievements seed skipped:', (e as Error).message)
  }

  try {
    console.log('Seeding items...')
    for (const i of seedItems) {
      await db
        .insert(items)
        .values({ id: randomUUID(), ...i })
        .onConflictDoNothing({ target: items.code })
    }
  } catch (e) {
    console.error('Items seed skipped:', (e as Error).message)
  }

  try {
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
  } catch (e) {
    console.error('Level rewards seed skipped:', (e as Error).message)
  }

  try {
    console.log('Seeding demo user...')
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, SEED_EMAIL))
      .limit(1)
    let userId: string
    if (existingUser) {
      userId = existingUser.id
      console.log('  Demo user already exists, using existing')
    } else {
      const hashedPassword = await bunPassword.hash(SEED_PASSWORD)
      const [newUser] = await db
        .insert(users)
        .values({ email: SEED_EMAIL, passwordHash: hashedPassword, nickname: 'TestUser' })
        .returning()
      userId = newUser!.id
      await db.insert(privacySettings).values({ userId })
      console.log('  Created demo user:', userId)
    }

    console.log('Seeding tags...')
    const tagIds: string[] = []
    for (const td of tagDefs) {
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.name, td.name))
        .limit(1)
      if (existingTag) {
        tagIds.push(existingTag.id)
        continue
      }
      const id = randomUUID()
      await db.insert(tags).values({ id, userId, ...td })
      tagIds.push(id)
    }
    console.log(`  Created/loaded ${tagIds.length} tags`)

    console.log('Seeding tasks...')
    const taskSeeds = [
      {
        title: 'Preparar presentación del proyecto',
        description: 'Revisar slides y practicar la demo para la reunión con stakeholders',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: daysFromNow(1),
        estimatedTime: 60,
        tagIdx: 0,
      },
      {
        title: 'Responder correos pendientes',
        description: 'Correos del equipo de desarrollo y clientes',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        dueDate: daysFromNow(-1),
        estimatedTime: 30,
        completedAt: new Date(),
        tagIdx: 0,
      },
      {
        title: 'Hacer ejercicio matutino',
        description: '30 minutos de cardio y estiramientos',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: daysFromNow(0),
        estimatedTime: 30,
        tagIdx: 2,
      },
      {
        title: 'Leer capitulo 5 del libro',
        description: 'Libro: Hábitos Atómicos - completar resumen',
        priority: 'LOW',
        status: 'PENDING',
        dueDate: daysFromNow(3),
        estimatedTime: 45,
        tagIdx: 1,
      },
      {
        title: 'Pagar facturas del mes',
        description: 'Agua, luz, internet y tarjeta de crédito',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: daysFromNow(2),
        estimatedTime: 20,
        tagIdx: 4,
      },
      {
        title: 'Completar curso de TypeScript',
        description: 'Módulo 4: Generics y utility types',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        dueDate: daysFromNow(-3),
        estimatedTime: 120,
        completedAt: new Date(Date.now() - 3 * 86400000),
        tagIdx: 3,
      },
      {
        title: 'Comprar víveres',
        description: 'Lista: verduras, frutas, lácteos y pan',
        priority: 'LOW',
        status: 'COMPLETED',
        dueDate: daysFromNow(-2),
        estimatedTime: 45,
        completedAt: new Date(Date.now() - 2 * 86400000),
        tagIdx: 4,
      },
      {
        title: 'Preparar informe semanal',
        description: 'Reporte de métricas para el equipo',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: daysFromNow(0),
        estimatedTime: 45,
        tagIdx: 0,
      },
      {
        title: 'Revisión médica general',
        description: 'Cita con el doctor a las 14:00',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: daysFromNow(7),
        estimatedTime: 60,
        tagIdx: 2,
      },
      {
        title: 'Organizar escritorio',
        description: 'Limpiar y organizar documentos pendientes',
        priority: 'LOW',
        status: 'PENDING',
        dueDate: daysFromNow(5),
        estimatedTime: 30,
        tagIdx: 4,
      },
    ]
    let createdCount = 0
    for (const ts of taskSeeds) {
      const id = randomUUID()
      await db.insert(tasks).values({
        id,
        userId,
        title: ts.title,
        description: ts.description,
        priority: ts.priority,
        status: ts.status,
        dueDate: ts.dueDate,
        estimatedTime: ts.estimatedTime,
        completedAt: ts.status === 'COMPLETED' ? (ts.completedAt ?? new Date()) : null,
      })
      if (tagIds[ts.tagIdx]) {
        await db.insert(taskTags).values({ taskId: id, tagId: tagIds[ts.tagIdx] })
      }
      createdCount++
    }
    console.log(`  Created ${createdCount} tasks`)
  } catch (e) {
    console.error('Demo data seed skipped:', (e as Error).message)
  }

  console.log('Seed completed!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
