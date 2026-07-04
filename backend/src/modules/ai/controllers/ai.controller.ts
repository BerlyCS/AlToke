import { Elysia } from 'elysia'
import { AIModel } from '../dto'
import { AIService } from '../services'

const serializeSuggestion = (
  suggestion: Awaited<ReturnType<typeof AIService.generateRecommendations>>[number],
) => ({
  ...suggestion,
  suggestedTime: suggestion.suggestedTime.toISOString(),
  createdAt: suggestion.createdAt.toISOString(),
})

export const aiController = new Elysia({ prefix: '/ai' })
  .get(
    '/suggestions',
    async ({ query }) => {
      const suggestions = await AIService.generateRecommendations(query.userId)
      return { suggestions: suggestions.map(serializeSuggestion) }
    },
    {
      query: AIModel.suggestionsQuery,
      response: {
        200: AIModel.generateRecommendationsResponse,
      },
    },
  )
  .post(
    '/suggestions/:id/feedback',
    async ({ params, body }) => {
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
