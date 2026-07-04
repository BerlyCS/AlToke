import { t, type UnwrapSchema } from 'elysia'

export const SuggestionsQuery = t.Object({})

export const PredictOverloadQuery = t.Object({
  date: t.String(),
})

export const FeedbackSchema = t.Object({
  accepted: t.Boolean(),
})

export const SuggestionIdParams = t.Object({
  id: t.String(),
})

export type SuggestionsQuery = UnwrapSchema<typeof SuggestionsQuery>
export type PredictOverloadQuery = UnwrapSchema<typeof PredictOverloadQuery>
export type FeedbackSchema = UnwrapSchema<typeof FeedbackSchema>
export type SuggestionIdParams = UnwrapSchema<typeof SuggestionIdParams>
