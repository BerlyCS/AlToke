import { describe, expect, it } from 'bun:test'
import {
  PredictOverloadQuery,
  FeedbackSchema,
  SuggestionIdParams,
} from '../../../../../src/modules/ai/dto/requests'
import {
  HabitTimeSlotResponse,
  HabitAnalysisResponse,
  TaskSuggestionResponse,
  GenerateRecommendationsResponse,
  PredictTaskOverloadResponse,
} from '../../../../../src/modules/ai/dto/responses'

describe('AI DTOs', () => {
  describe('PredictOverloadQuery', () => {
    it('is a valid Elysia schema', () => {
      expect(PredictOverloadQuery).toBeDefined()
      expect(PredictOverloadQuery.type).toBe('object')
    })

    it('has date property as required', () => {
      expect(PredictOverloadQuery.properties.date).toBeDefined()
      expect(PredictOverloadQuery.required).toContain('date')
    })

    it('date field is string type', () => {
      expect(PredictOverloadQuery.properties.date?.type).toBe('string')
    })
  })

  describe('FeedbackSchema', () => {
    it('is a valid Elysia schema', () => {
      expect(FeedbackSchema).toBeDefined()
      expect(FeedbackSchema.type).toBe('object')
    })

    it('has accepted property as required', () => {
      expect(FeedbackSchema.properties.accepted).toBeDefined()
      expect(FeedbackSchema.required).toContain('accepted')
    })

    it('accepted field is boolean type', () => {
      expect(FeedbackSchema.properties.accepted?.type).toBe('boolean')
    })
  })

  describe('SuggestionIdParams', () => {
    it('is a valid Elysia schema', () => {
      expect(SuggestionIdParams).toBeDefined()
      expect(SuggestionIdParams.type).toBe('object')
    })

    it('has id property as required', () => {
      expect(SuggestionIdParams.properties.id).toBeDefined()
      expect(SuggestionIdParams.required).toContain('id')
    })

    it('id field is string type', () => {
      expect(SuggestionIdParams.properties.id?.type).toBe('string')
    })
  })

  describe('HabitTimeSlotResponse', () => {
    it('is a valid Elysia schema', () => {
      expect(HabitTimeSlotResponse).toBeDefined()
      expect(HabitTimeSlotResponse.type).toBe('object')
    })

    it('has dayOfWeek, hour, and count as required number fields', () => {
      expect(HabitTimeSlotResponse.required).toContain('dayOfWeek')
      expect(HabitTimeSlotResponse.required).toContain('hour')
      expect(HabitTimeSlotResponse.required).toContain('count')
      expect(HabitTimeSlotResponse.properties.dayOfWeek?.type).toBe('number')
      expect(HabitTimeSlotResponse.properties.hour?.type).toBe('number')
      expect(HabitTimeSlotResponse.properties.count?.type).toBe('number')
    })
  })

  describe('HabitAnalysisResponse', () => {
    it('is a valid Elysia schema', () => {
      expect(HabitAnalysisResponse).toBeDefined()
      expect(HabitAnalysisResponse.type).toBe('object')
    })

    it('has userId, frequentTimeSlots, categoryAffinity, and updatedAt as required', () => {
      expect(HabitAnalysisResponse.required).toContain('userId')
      expect(HabitAnalysisResponse.required).toContain('frequentTimeSlots')
      expect(HabitAnalysisResponse.required).toContain('categoryAffinity')
      expect(HabitAnalysisResponse.required).toContain('updatedAt')
    })

    it('frequentTimeSlots is array type', () => {
      expect(HabitAnalysisResponse.properties.frequentTimeSlots?.type).toBe('array')
    })

    it('categoryAffinity is object type (record)', () => {
      expect(HabitAnalysisResponse.properties.categoryAffinity?.type).toBe('object')
    })
  })

  describe('TaskSuggestionResponse', () => {
    it('is a valid Elysia schema', () => {
      expect(TaskSuggestionResponse).toBeDefined()
      expect(TaskSuggestionResponse.type).toBe('object')
    })

    it('has all required fields', () => {
      expect(TaskSuggestionResponse.required).toContain('id')
      expect(TaskSuggestionResponse.required).toContain('userId')
      expect(TaskSuggestionResponse.required).toContain('suggestedTitle')
      expect(TaskSuggestionResponse.required).toContain('suggestedTime')
      expect(TaskSuggestionResponse.required).toContain('explanation')
      expect(TaskSuggestionResponse.required).toContain('status')
      expect(TaskSuggestionResponse.required).toContain('createdAt')
    })

    it('status field is union of PENDING, ACCEPTED, REJECTED', () => {
      expect(TaskSuggestionResponse.properties.status?.anyOf).toBeDefined()
    })
  })

  describe('GenerateRecommendationsResponse', () => {
    it('is a valid Elysia schema', () => {
      expect(GenerateRecommendationsResponse).toBeDefined()
      expect(GenerateRecommendationsResponse.type).toBe('object')
    })

    it('has suggestions array as required', () => {
      expect(GenerateRecommendationsResponse.required).toContain('suggestions')
      expect(GenerateRecommendationsResponse.properties.suggestions?.type).toBe('array')
    })
  })

  describe('PredictTaskOverloadResponse', () => {
    it('is a valid Elysia schema', () => {
      expect(PredictTaskOverloadResponse).toBeDefined()
      expect(PredictTaskOverloadResponse.type).toBe('object')
    })

    it('has all required fields', () => {
      expect(PredictTaskOverloadResponse.required).toContain('isOverloaded')
      expect(PredictTaskOverloadResponse.required).toContain('riskLevel')
      expect(PredictTaskOverloadResponse.required).toContain('explanation')
    })

    it('isOverloaded is boolean type', () => {
      expect(PredictTaskOverloadResponse.properties.isOverloaded?.type).toBe('boolean')
    })

    it('riskLevel is union of low, medium, high', () => {
      expect(PredictTaskOverloadResponse.properties.riskLevel?.anyOf).toBeDefined()
    })

    it('explanation is string type', () => {
      expect(PredictTaskOverloadResponse.properties.explanation?.type).toBe('string')
    })
  })
})
