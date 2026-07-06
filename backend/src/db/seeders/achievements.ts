import { db } from '../index'
import { achievements } from '../schema'

const initialAchievements = [
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

  {
    code: 'xp_5',
    title: 'Subiendo de nivel',
    description: 'Alcanzaste el nivel 5.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'xp_10',
    title: 'Veterano',
    description: 'Alcanzaste el nivel 10.',
    isSecret: false,
    requiredXp: 0,
  },
  {
    code: 'xp_50',
    title: 'Leyenda',
    description: 'Alcanzaste el nivel 50.',
    isSecret: true,
    requiredXp: 0,
  },

  {
    code: 'streak_3',
    title: 'En racha',
    description: 'Mantuviste una racha de 3 días consecutivos.',
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

export async function seedAchievements() {
  console.log('Seeding achievements...')
  for (const ach of initialAchievements) {
    await db.insert(achievements).values(ach).onConflictDoNothing({ target: achievements.code })
  }
  console.log('Achievements seeded')
}
