// AI Repository
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../../db'
import { aiHabitAnalyses, taskSuggestions, tasks } from '../../../db/schema'
import type { HabitAnalysis, HabitTimeSlot, SuggestionStatus, TaskSuggestion } from '../domain'

const activityAt = sql<Date>`coalesce(${tasks.completedAt}, ${tasks.dueDate}, ${tasks.startDate})`

const toHabitAnalysis = (row: typeof aiHabitAnalyses.$inferSelect): HabitAnalysis => ({
  userId: row.userId,
  frequentTimeSlots: Array.isArray(row.frequentTimeSlots)
    ? (row.frequentTimeSlots as HabitTimeSlot[])
    : [],
  categoryAffinity:
    row.categoryAffinity && typeof row.categoryAffinity === 'object'
      ? (row.categoryAffinity as Record<string, number>)
      : {},
  updatedAt: row.updatedAt,
})

const toTaskSuggestion = (row: typeof taskSuggestions.$inferSelect): TaskSuggestion => ({
  id: row.id,
  userId: row.userId,
  suggestedTitle: row.suggestedTitle,
  suggestedTime: row.suggestedTime,
  explanation: row.explanation,
  status: row.status as SuggestionStatus,
  createdAt: row.createdAt,
})

export abstract class AIRepository {
  static async getHabitAnalysis(userId: string): Promise<HabitAnalysis> {
    const slotRows = await db
      .select({
        weekday: sql<number>`extract(dow from ${activityAt})::int`,
        hour: sql<number>`extract(hour from ${activityAt})::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          sql`${activityAt} is not null`,
          sql`${tasks.deletedAt} is null`,
        ),
      )
      .groupBy(
        sql`extract(dow from ${activityAt})::int`,
        sql`extract(hour from ${activityAt})::int`,
      )

    const categoryRows = await db
      .select({
        category: tasks.type,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          sql`${activityAt} is not null`,
          sql`${tasks.deletedAt} is null`,
        ),
      )
      .groupBy(tasks.type)

    const totalCount = categoryRows.reduce((sum, row) => sum + row.count, 0)
    const frequentTimeSlots = slotRows.map((row) => ({
      dayOfWeek: row.weekday,
      hour: row.hour,
      count: row.count,
    }))
    const categoryAffinity = categoryRows.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.category] = totalCount > 0 ? Number((row.count / totalCount).toFixed(3)) : 0
      return accumulator
    }, {})

    const habitAnalysis = {
      userId,
      frequentTimeSlots,
      categoryAffinity,
      updatedAt: new Date(),
    }

    await this.saveHabitAnalysis(habitAnalysis)
    return habitAnalysis
  }

  static async saveHabitAnalysis(analysis: HabitAnalysis): Promise<HabitAnalysis> {
    const [saved] = await db
      .insert(aiHabitAnalyses)
      .values({
        userId: analysis.userId,
        frequentTimeSlots: analysis.frequentTimeSlots,
        categoryAffinity: analysis.categoryAffinity,
        updatedAt: analysis.updatedAt,
      })
      .onConflictDoUpdate({
        target: aiHabitAnalyses.userId,
        set: {
          frequentTimeSlots: analysis.frequentTimeSlots,
          categoryAffinity: analysis.categoryAffinity,
          updatedAt: analysis.updatedAt,
        },
      })
      .returning()

    return saved ? toHabitAnalysis(saved) : analysis
  }

  static async findHabitAnalysisByUserId(userId: string): Promise<HabitAnalysis | null> {
    const [row] = await db
      .select()
      .from(aiHabitAnalyses)
      .where(eq(aiHabitAnalyses.userId, userId))
      .limit(1)
    return row ? toHabitAnalysis(row) : null
  }

  static async saveSuggestion(suggestion: TaskSuggestion): Promise<TaskSuggestion> {
    const [saved] = await db
      .insert(taskSuggestions)
      .values({
        id: suggestion.id,
        userId: suggestion.userId,
        suggestedTitle: suggestion.suggestedTitle,
        suggestedTime: suggestion.suggestedTime,
        explanation: suggestion.explanation,
        status: suggestion.status,
        createdAt: suggestion.createdAt,
      })
      .returning()

    return saved ? toTaskSuggestion(saved) : suggestion
  }

  static async updateSuggestionStatus(
    suggestionId: string,
    status: SuggestionStatus,
  ): Promise<TaskSuggestion | null> {
    const [updated] = await db
      .update(taskSuggestions)
      .set({ status })
      .where(eq(taskSuggestions.id, suggestionId))
      .returning()

    return updated ? toTaskSuggestion(updated) : null
  }

  static async findSuggestionById(suggestionId: string): Promise<TaskSuggestion | null> {
    const [row] = await db
      .select()
      .from(taskSuggestions)
      .where(eq(taskSuggestions.id, suggestionId))
      .limit(1)
    return row ? toTaskSuggestion(row) : null
  }

  static async getSuggestionsHistory(userId: string): Promise<TaskSuggestion[]> {
    const rows = await db
      .select()
      .from(taskSuggestions)
      .where(eq(taskSuggestions.userId, userId))
      .orderBy(desc(taskSuggestions.createdAt))

    return rows.map(toTaskSuggestion)
  }
}
// AI Repository
export {}
