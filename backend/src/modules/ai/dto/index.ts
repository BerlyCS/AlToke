import {
  FeedbackSchema,
  PredictOverloadQuery,
  SuggestionIdParams,
  SuggestionsQuery,
} from './requests'
import {
  GenerateRecommendationsResponse,
  HabitAnalysisResponse,
  HabitTimeSlotResponse,
  PredictTaskOverloadResponse,
  TaskSuggestionResponse,
} from './responses'

export * from './requests'
export * from './responses'

export const AIModel = {
  suggestionsQuery: SuggestionsQuery,
  predictOverloadQuery: PredictOverloadQuery,
  feedbackBody: FeedbackSchema,
  suggestionIdParams: SuggestionIdParams,
  habitTimeSlotResponse: HabitTimeSlotResponse,
  habitAnalysisResponse: HabitAnalysisResponse,
  taskSuggestionResponse: TaskSuggestionResponse,
  generateRecommendationsResponse: GenerateRecommendationsResponse,
  predictTaskOverloadResponse: PredictTaskOverloadResponse,
} as const
