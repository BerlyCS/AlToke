import { Elysia } from 'elysia'
import { authPlugin } from '../../../shared/utils/auth-plugin'
import { AIModel } from '../dto'
import { AIService } from '../services'

const serializeSuggestion = (
  suggestion: Awaited<ReturnType<typeof AIService.generateRecommendations>>[number],
) => ({
  ...suggestion,
  suggestedTime: suggestion.suggestedTime.toISOString(),
  createdAt: suggestion.createdAt.toISOString(),
})

const serializePrediction = (
  prediction: Awaited<ReturnType<typeof AIService.predictTaskOverload>>,
) => ({
  ...prediction,
})

export const aiController = new Elysia({ prefix: '/ai' })
  .use(authPlugin)
  .get(
    '/suggestions',
    async ({ requireAuth }) => {
      const userId = requireAuth()
      const suggestions = await AIService.generateRecommendations(userId)
      return { suggestions: suggestions.map(serializeSuggestion) }
    },
    {
      response: {
        200: AIModel.generateRecommendationsResponse,
      },
    },
  )
  .post(
    '/suggestions/:id/feedback',
    async ({ requireAuth, params, body }) => {
      requireAuth()
      const suggestion = await AIService.processFeedback(params.id, body.accepted)
      return serializeSuggestion(suggestion)
    },
    {
      params: AIModel.suggestionIdParams,
      body: AIModel.feedbackBody,
      response: {
        200: AIModel.taskSuggestionResponse,
      },
    },
  )
  .get(
    '/overload',
    async ({ requireAuth, query }) => {
      const userId = requireAuth()
      const prediction = await AIService.predictTaskOverload(userId, new Date(query.date))
      return serializePrediction(prediction)
    },
    {
      query: AIModel.predictOverloadQuery,
      response: {
        200: AIModel.predictTaskOverloadResponse,
      },
    },
  )
