// AI Domain Entities
import type { Task } from '../../task/domain'

export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type HabitTimeSlot = {
  dayOfWeek: number
  hour: number
  count: number
}

export type HabitAnalysis = {
  userId: string
  frequentTimeSlots: HabitTimeSlot[]
  categoryAffinity: Record<string, number>
  updatedAt: Date
}

export type TaskSuggestion = {
  id: string
  userId: string
  suggestedTitle: string
  suggestedTime: Date
  explanation: string
  status: SuggestionStatus
  createdAt: Date
}

export type RecommendationContext = {
  habitAnalysis: HabitAnalysis
  recentTasks: Task[]
}

export type OverloadContext = {
  assignedTasks: number
  totalEstimatedMinutes: number
  historicalAverageTasks: number
  historicalAverageMinutes: number
  differencePercent: number
  date: string
  weekday: number
}

export type TaskOverloadPrediction = {
  isOverloaded: boolean
  riskLevel: 'low' | 'medium' | 'high'
  explanation: string
}
