import { t, type UnwrapSchema } from 'elysia'

export const HabitTimeSlotResponse = t.Object({
  dayOfWeek: t.Number(),
  hour: t.Number(),
  count: t.Number(),
})

export const HabitAnalysisResponse = t.Object({
  userId: t.String(),
  frequentTimeSlots: t.Array(HabitTimeSlotResponse),
  categoryAffinity: t.Record(t.String(), t.Number()),
  updatedAt: t.String(),
})

export const TaskSuggestionResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  suggestedTitle: t.String(),
  suggestedTime: t.String(),
  explanation: t.String(),
  status: t.Union([t.Literal('PENDING'), t.Literal('ACCEPTED'), t.Literal('REJECTED')]),
  createdAt: t.String(),
})

export const GenerateRecommendationsResponse = t.Object({
  suggestions: t.Array(TaskSuggestionResponse),
})

export const PredictTaskOverloadResponse = t.Object({
  isOverloaded: t.Boolean(),
  riskLevel: t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')]),
  explanation: t.String(),
})

export type HabitTimeSlotResponse = UnwrapSchema<typeof HabitTimeSlotResponse>
export type HabitAnalysisResponse = UnwrapSchema<typeof HabitAnalysisResponse>
export type TaskSuggestionResponse = UnwrapSchema<typeof TaskSuggestionResponse>
export type GenerateRecommendationsResponse = UnwrapSchema<typeof GenerateRecommendationsResponse>
export type PredictTaskOverloadResponse = UnwrapSchema<typeof PredictTaskOverloadResponse>
export {}
