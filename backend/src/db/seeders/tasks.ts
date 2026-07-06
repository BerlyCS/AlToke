import { db } from '../index'
import { tasks, tags, taskTags } from '../schema'
import type { users } from '../schema'
import type { InferSelectModel } from 'drizzle-orm'

type User = InferSelectModel<typeof users>

const taskTemplates = [
  {
    title: 'Comprar víveres',
    description: 'Leche, pan, huevos, frutas',
    type: 'HABIT',
    priority: 'HIGH',
  },
  {
    title: 'Revisar correos',
    description: 'Responder los correos del trabajo',
    type: 'TASK',
    priority: 'MEDIUM',
  },
  {
    title: 'Hacer ejercicio',
    description: 'Rutina de 45 minutos',
    type: 'HABIT',
    priority: 'HIGH',
  },
  {
    title: 'Reunión con equipo',
    description: 'Discutir avances del proyecto',
    type: 'EVENT',
    priority: 'HIGH',
  },
  {
    title: 'Pagar servicios',
    description: 'Luz, agua, internet',
    type: 'TASK',
    priority: 'LOW',
  },
  {
    title: 'Leer un libro',
    description: 'Avanzar 20 páginas',
    type: 'HABIT',
    priority: 'LOW',
  },
  {
    title: 'Pasear al perro',
    description: 'Ir al parque por la tarde',
    type: 'TASK',
    priority: 'MEDIUM',
  },
  {
    title: 'Estudiar programación',
    description: 'Avanzar curso en Udemy',
    type: 'HABIT',
    priority: 'HIGH',
  },
  {
    title: 'Limpiar la casa',
    description: 'Aspirar y trapear',
    type: 'TASK',
    priority: 'MEDIUM',
  },
  {
    title: 'Llamar a mamá',
    description: 'Saber cómo está',
    type: 'TASK',
    priority: 'HIGH',
  },
  {
    title: 'Terminar reporte',
    description: 'Reporte mensual de ventas',
    type: 'TASK',
    priority: 'HIGH',
  },
  {
    title: 'Ir al dentista',
    description: 'Limpieza anual',
    type: 'EVENT',
    priority: 'MEDIUM',
  },
  {
    title: 'Practicar guitarra',
    description: 'Practicar acordes básicos',
    type: 'HABIT',
    priority: 'LOW',
  },
  {
    title: 'Cita médica',
    description: 'Revisión general',
    type: 'EVENT',
    priority: 'HIGH',
  },
  {
    title: 'Ver película',
    description: 'Ver la nueva película en Netflix',
    type: 'TASK',
    priority: 'LOW',
  },
  {
    title:
      'Esta es una tarea con un título extremadamente largo para probar cómo se ve en la interfaz del frontend cuando el texto ocupa múltiples líneas y puede romper el diseño si no se trunca o maneja correctamente con flex o grid.',
    description: 'Descripción corta.',
    type: 'TASK',
    priority: 'HIGH',
  },
  {
    title: 'Tarea con descripción inmensa',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    type: 'TASK',
    priority: 'MEDIUM',
  },
  {
    title: 'Proyecto Titán (Larga duración)',
    description: 'Desarrollar la nueva funcionalidad core',
    type: 'EVENT',
    priority: 'HIGH',
  },
]

const tagTemplates = [
  { name: 'Trabajo', color: 'bg-red-500', icon: 'Briefcase' },
  { name: 'Hogar', color: 'bg-emerald-500', icon: 'Home' },
  { name: 'Salud', color: 'bg-blue-500', icon: 'Heart' },
  { name: 'Estudio', color: 'bg-amber-500', icon: 'Book' },
  { name: 'Ocio', color: 'bg-purple-500', icon: 'Coffee' },
]

function getRandomDateWithinRange(startDaysOffset: number, endDaysOffset: number) {
  const today = new Date()
  const offset = startDaysOffset + Math.random() * (endDaysOffset - startDaysOffset)
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  return d
}

export async function seedTasks(createdUsers: User[]) {
  console.log('Seeding tags and tasks...')

  for (const user of createdUsers) {
    const userTagsData = tagTemplates.map((t) => ({ ...t, userId: user.id }))
    const createdTags = await db.insert(tags).values(userTagsData).returning()

    const userTasks = []

    for (let i = 0; i < 25; i++) {
      const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)]

      const date = getRandomDateWithinRange(-15, 15)
      const now = new Date()

      let status = 'PENDING'
      let completedAt = null
      if (date < now) {
        status = Math.random() > 0.3 ? 'COMPLETED' : 'PENDING'
        if (status === 'COMPLETED') {
          completedAt = new Date(date)
          completedAt.setHours(completedAt.getHours() + Math.random() * 5)
        }
      }

      let estimatedTime: number | null = [15, 30, 45, 60, 90, 120][Math.floor(Math.random() * 6)]
      if (template.title.includes('Larga duración')) {
        estimatedTime = 1440
      } else if (Math.random() > 0.8) {
        estimatedTime = null
      }

      userTasks.push({
        userId: user.id,
        title: template.title,
        description: template.description,
        type: template.type,
        priority: template.priority,
        status,
        estimatedTime,
        startDate: date,
        dueDate: date,
        completedAt,
        recurrence: template.type === 'HABIT' ? (Math.random() > 0.5 ? 'DAILY' : 'WEEKLY') : 'NONE',
      })
    }

    const insertedTasks = await db
      .insert(tasks)
      .values(userTasks as any)
      .returning()

    const taskTagsData = []
    for (const task of insertedTasks) {
      const rand = Math.random()

      if (rand > 0.3) {
        let numTags = Math.floor(Math.random() * 2) + 1
        if (rand > 0.8) numTags = createdTags.length

        const shuffledTags = [...createdTags].sort(() => 0.5 - Math.random())
        for (let j = 0; j < numTags; j++) {
          taskTagsData.push({
            taskId: task.id,
            tagId: shuffledTags[j].id,
          })
        }
      }
    }

    if (taskTagsData.length > 0) {
      await db.insert(taskTags).values(taskTagsData)
    }
  }

  console.log('Tags and tasks seeded')
}
