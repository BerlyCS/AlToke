import { randomUUID } from 'node:crypto'
import OpenAI from 'openai'
import { status } from 'elysia'
import { z } from 'zod'
import { AIRepository } from '../repositories'
import { TaskRepository } from '../../task/repositories'
import type {
  HabitAnalysis,
  OverloadContext,
  TaskOverloadPrediction,
  TaskSuggestion,
} from '../domain'

let _deepseek: OpenAI | null = null
const getDeepSeek = () => {
  if (!_deepseek) {
    _deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    })
  }
  return _deepseek
}

export const recommendationSchema = z.object({
  suggestions: z
    .array(
      z.object({
        suggestedTitle: z.string().min(1),
        suggestedTime: z.string().datetime({ offset: true }),
        explanation: z.string().min(1),
      }),
    )
    .max(3),
})

export const overloadSchema = z.object({
  isOverloaded: z.boolean(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  explanation: z.string().min(1),
})

const sleep = async (milliseconds: number) => {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export const sameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

export const toDateKey = (date: Date) => date.toISOString().slice(0, 10)

export const activityAt = (task: {
  completionDate: Date | null
  dueDate: Date | null
  startTime: Date | null
}) => task.completionDate ?? task.dueDate ?? task.startTime

export const buildSystemPrompt = (title: string, example: string) =>
  [
    title,
    'Responde en formato json, sin markdown, sin texto adicional fuera del objeto.',
    '',
    'Ejemplo del formato esperado:',
    example,
    '',
    'No incluyas ```json ni texto fuera del objeto.',
  ].join('\n')

const parseWithRetry = async <TInput, TOutput>(options: {
  systemPrompt: string
  userPayload: TInput
  maxTokens: number
  schema: z.ZodType<TOutput>
}) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await getDeepSeek().chat.completions.create({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
        response_format: { type: 'json_object' },
        max_tokens: attempt === 0 ? options.maxTokens : Math.round(options.maxTokens * 1.5),
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: JSON.stringify(options.userPayload) },
        ],
      })

      const choice = response.choices[0]
      if (choice?.finish_reason === 'length') {
        throw new Error('DeepSeek response was truncated')
      }

      const content = choice?.message.content ?? ''
      if (!content.trim()) {
        throw new Error('DeepSeek returned empty content')
      }

      const parsed = JSON.parse(content)
      const validated = options.schema.safeParse(parsed)
      if (!validated.success) {
        throw new Error(validated.error.message)
      }

      return validated.data
    } catch (error) {
      console.error('DeepSeek request failed', error)
      if (attempt === 0) {
        await sleep(250)
        continue
      }
    }
  }

  throw status(503, 'AI service unavailable')
}

export const buildTimeSlotKey = (date: Date) => `${date.getDay()}-${date.getHours()}`

export const adjustHabitAnalysisAfterRejection = (
  analysis: HabitAnalysis,
  suggestionTime: Date,
): HabitAnalysis => {
  const slotKey = buildTimeSlotKey(suggestionTime)

  return {
    ...analysis,
    frequentTimeSlots: analysis.frequentTimeSlots.map((slot) =>
      `${slot.dayOfWeek}-${slot.hour}` === slotKey
        ? { ...slot, count: Math.max(0, slot.count - 1) }
        : slot,
    ),
    categoryAffinity: Object.fromEntries(
      Object.entries(analysis.categoryAffinity).map(([category, affinity]) => [
        category,
        Number(Math.max(0, affinity * 0.98).toFixed(3)),
      ]),
    ),
    updatedAt: new Date(),
  }
}

export class AIService {
  static async generateRecommendations(userId: string): Promise<TaskSuggestion[]> {
    try {
      const habitAnalysis = await AIRepository.getHabitAnalysis(userId)
      const recentTasks = await TaskRepository.getRecentTasks(userId, 10)
      const recentHistory = await AIRepository.getSuggestionsHistory(userId)

      await AIRepository.saveHabitAnalysis(habitAnalysis)

      const systemPrompt = buildSystemPrompt(
        'Eres un asistente que sugiere tareas basado en hábitos del usuario.',
        '{\n  "suggestions": [\n    {\n      "suggestedTitle": "Repasar apuntes de Redes",\n      "suggestedTime": "2026-07-04T18:00:00Z",\n      "explanation": "Sueles completar tareas académicas los viernes por la tarde."\n    }\n  ]\n}',
      )

      const payload = await parseWithRetry({
        systemPrompt,
        userPayload: {
          habitAnalysis,
          recentTasks,
          recentHistory: recentHistory.slice(0, 5),
        },
        maxTokens: 3000,
        schema: recommendationSchema,
      })

      return await Promise.all(
        payload.suggestions.map(async (suggestion) =>
          AIRepository.saveSuggestion({
            id: randomUUID(),
            userId,
            suggestedTitle: suggestion.suggestedTitle,
            suggestedTime: new Date(suggestion.suggestedTime),
            explanation: suggestion.explanation,
            status: 'PENDING',
            createdAt: new Date(),
          }),
        ),
      )
    } catch (error) {
      console.error('generateRecommendations fallback', error)
      return []
    }
  }

  static async predictTaskOverload(userId: string, date: Date): Promise<TaskOverloadPrediction> {
    try {
      const allTasks = await TaskRepository.findByUserId(userId)
      const targetTasks = allTasks.filter((task) => {
        const current = activityAt(task)
        return current ? sameDay(current, date) : false
      })

      const weekday = date.getDay()
      const historicGroups = new Map<string, { count: number; minutes: number }>()

      for (const task of allTasks) {
        const current = activityAt(task)
        if (!current || sameDay(current, date) || current.getDay() !== weekday) {
          continue
        }

        const key = toDateKey(current)
        const group = historicGroups.get(key) ?? { count: 0, minutes: 0 }
        group.count += 1
        group.minutes += task.estimatedTimeMinutes
        historicGroups.set(key, group)
      }

      const historicValues = Array.from(historicGroups.values())
      const historicalAverageTasks =
        historicValues.length > 0
          ? historicValues.reduce((sum, entry) => sum + entry.count, 0) / historicValues.length
          : 0
      const historicalAverageMinutes =
        historicValues.length > 0
          ? historicValues.reduce((sum, entry) => sum + entry.minutes, 0) / historicValues.length
          : 0
      const totalEstimatedMinutes = targetTasks.reduce(
        (sum, task) => sum + task.estimatedTimeMinutes,
        0,
      )
      const assignedTasks = targetTasks.length
      const differencePercent =
        historicalAverageTasks > 0
          ? ((assignedTasks - historicalAverageTasks) / historicalAverageTasks) * 100
          : assignedTasks > 0
            ? 100
            : 0

      const systemPrompt = buildSystemPrompt(
        'Eres un asistente que evalúa si un usuario está sobrecargado de tareas.',
        '{\n  "isOverloaded": true,\n  "riskLevel": "high",\n  "explanation": "Tienes 40% más tareas que tu promedio habitual para este día."\n}',
      )

      return await parseWithRetry({
        systemPrompt,
        userPayload: {
          assignedTasks,
          totalEstimatedMinutes,
          historicalAverageTasks,
          historicalAverageMinutes,
          differencePercent,
          date: date.toISOString(),
          weekday,
        } satisfies OverloadContext,
        maxTokens: 500,
        schema: overloadSchema,
      })
    } catch (error) {
      console.error('predictTaskOverload fallback', error)
      return {
        isOverloaded: false,
        riskLevel: 'low',
        explanation: 'No se pudo evaluar la sobrecarga en este momento.',
      }
    }
  }

  static async processFeedback(suggestionId: string, accepted: boolean): Promise<TaskSuggestion> {
    const existing = await AIRepository.findSuggestionById(suggestionId)
    if (!existing) {
      throw status(404, 'Suggestion not found')
    }

    const nextStatus = accepted ? 'ACCEPTED' : 'REJECTED'
    const updated = await AIRepository.updateSuggestionStatus(suggestionId, nextStatus)
    if (!updated) {
      throw status(404, 'Suggestion not found')
    }

    if (!accepted) {
      const habitAnalysis = await AIRepository.findHabitAnalysisByUserId(existing.userId)
      if (habitAnalysis) {
        await AIRepository.saveHabitAnalysis(
          adjustHabitAnalysisAfterRejection(habitAnalysis, existing.suggestedTime),
        )
      }
    }

    return updated
  }
}
