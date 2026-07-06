import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { achievements } from './schema'

const sql = postgres(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/altoke',
)
const db = drizzle(sql)

const initialAchievements = [
  // Firsts
  {
    code: 'first_login',
    title: '¡Bienvenido a bordo!',
    description: 'Iniciaste sesión por primera vez.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'first_task_created',
    title: 'Organizador novato',
    description: 'Creaste tu primera tarea.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'first_task_completed',
    title: 'Manos a la obra',
    description: 'Completaste tu primera tarea.',
    isSecret: false,
    requiredXp: 0,
  },

  // Tasks completed
  {
    code: 'tasks_10',
    title: 'Productividad en marcha',
    description: 'Completaste 10 tareas.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'tasks_50',
    title: 'Imparable',
    description: 'Completaste 50 tareas.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'tasks_100',
    title: 'Maestro de la productividad',
    description: 'Completaste 100 tareas.',
    isSecret: true,
    requiredXp: 0,
  },

  // Levels
  {
    code: 'xp_5',
    title: 'Subiendo de nivel',
    description: 'Alcanzaste el Nivel 5.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'xp_10',
    title: 'Veterano',
    description: 'Alcanzaste el Nivel 10.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'xp_50',
    title: 'Leyenda viviente',
    description: 'Alcanzaste el Nivel 50.',
    isSecret: true,
    requiredXp: 0,
  },

  // Streaks
  {
    code: 'streak_3',
    title: 'Calentando motores',
    description: 'Mantuviste una racha de 3 días.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'streak_7',
    title: 'Constancia',
    description: 'Mantuviste una racha de 7 días consecutivos.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'streak_30',
    title: 'Disciplina de hierro',
    description: 'Mantuviste una racha de 30 días consecutivos.',
    isSecret: true,
    requiredXp: 0,
  },
]

async function seedAchievements() {
  console.log('Seeding achievements...')
  for (const ach of initialAchievements) {
    await db.insert(achievements).values(ach).onConflictDoNothing({ target: achievements.code })
  }
  console.log('Achievements seeded!')
  process.exit(0)
}

seedAchievements().catch(console.error)
