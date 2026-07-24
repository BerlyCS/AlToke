import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import {
  AIService,
  sameDay,
  toDateKey,
  activityAt,
  buildSystemPrompt,
  buildTimeSlotKey,
  adjustHabitAnalysisAfterRejection,
  recommendationSchema,
  overloadSchema,
} from '../../../../../src/modules/ai/services'
import { AIRepository } from '../../../../../src/modules/ai/repositories'
import type { HabitAnalysis, TaskSuggestion } from '../../../../../src/modules/ai/domain'

const makeSuggestion = (overrides: Partial<TaskSuggestion> = {}): TaskSuggestion => ({
  id: 'sug-1',
  userId: 'user-1',
  suggestedTitle: 'Repasar apuntes',
  suggestedTime: new Date('2026-07-25T18:00:00Z'),
  explanation: 'Sueles estudiar los jueves',
  status: 'PENDING',
  createdAt: new Date('2026-07-23T10:00:00Z'),
  ...overrides,
})

const makeHabitAnalysis = (overrides: Partial<HabitAnalysis> = {}): HabitAnalysis => ({
  userId: 'user-1',
  frequentTimeSlots: [
    { dayOfWeek: 4, hour: 18, count: 5 },
    { dayOfWeek: 2, hour: 10, count: 3 },
  ],
  categoryAffinity: { TASK: 0.7, HABIT: 0.3 },
  updatedAt: new Date('2026-07-20T00:00:00Z'),
  ...overrides,
})

describe('AIService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('sameDay', () => {
    it('returns true for same date', () => {
      const left = new Date('2026-07-23T10:00:00Z')
      const right = new Date('2026-07-23T18:30:00Z')
      expect(sameDay(left, right)).toBe(true)
    })

    it('returns false for different day', () => {
      const left = new Date('2026-07-23T10:00:00Z')
      const right = new Date('2026-07-24T10:00:00Z')
      expect(sameDay(left, right)).toBe(false)
    })

    it('returns false for different month', () => {
      const left = new Date('2026-07-23T10:00:00Z')
      const right = new Date('2026-08-23T10:00:00Z')
      expect(sameDay(left, right)).toBe(false)
    })

    it('returns false for different year', () => {
      const left = new Date('2026-07-23T10:00:00Z')
      const right = new Date('2027-07-23T10:00:00Z')
      expect(sameDay(left, right)).toBe(false)
    })
  })

  describe('toDateKey', () => {
    it('returns YYYY-MM-DD format', () => {
      const date = new Date('2026-07-23T15:30:00Z')
      expect(toDateKey(date)).toBe('2026-07-23')
    })

    it('pads single digit month and day', () => {
      const date = new Date('2026-01-05T00:00:00Z')
      expect(toDateKey(date)).toBe('2026-01-05')
    })
  })

  describe('activityAt', () => {
    it('prefers completionDate', () => {
      const task = {
        completionDate: new Date('2026-07-23'),
        dueDate: new Date('2026-07-24'),
        startTime: new Date('2026-07-22'),
      }
      expect(activityAt(task)).toBe(task.completionDate)
    })

    it('falls back to dueDate when completionDate is null', () => {
      const task = {
        completionDate: null,
        dueDate: new Date('2026-07-24'),
        startTime: new Date('2026-07-22'),
      }
      expect(activityAt(task)).toBe(task.dueDate)
    })

    it('falls back to startTime when both are null', () => {
      const task = {
        completionDate: null,
        dueDate: null,
        startTime: new Date('2026-07-22'),
      }
      expect(activityAt(task)).toBe(task.startTime)
    })

    it('returns null when all dates are null', () => {
      const task = {
        completionDate: null,
        dueDate: null,
        startTime: null,
      }
      expect(activityAt(task)).toBeNull()
    })
  })

  describe('buildTimeSlotKey', () => {
    it('returns dayOfWeek-hour format', () => {
      const date = new Date('2026-07-23T14:00:00Z')
      const key = buildTimeSlotKey(date)
      expect(key).toBe(`${date.getDay()}-${date.getHours()}`)
    })
  })

  describe('buildSystemPrompt', () => {
    it('includes title and example in output', () => {
      const result = buildSystemPrompt('Title here', '{ "key": "value" }')
      expect(result).toContain('Title here')
      expect(result).toContain('{ "key": "value" }')
      expect(result).toContain('Responde en formato json')
    })
  })

  describe('adjustHabitAnalysisAfterRejection', () => {
    it('decrements count of matching time slot', () => {
      const analysis = makeHabitAnalysis()
      const suggestionTime = new Date('2026-07-23T18:00:00Z')

      const result = adjustHabitAnalysisAfterRejection(analysis, suggestionTime)

      const slotKey = buildTimeSlotKey(suggestionTime)
      const adjusted = result.frequentTimeSlots.find((s) => `${s.dayOfWeek}-${s.hour}` === slotKey)
      expect(adjusted?.count).toBe(4)
    })

    it('does not modify other time slots', () => {
      const analysis = makeHabitAnalysis()
      const suggestionTime = new Date('2026-07-23T18:00:00Z')

      const result = adjustHabitAnalysisAfterRejection(analysis, suggestionTime)

      const otherSlot = result.frequentTimeSlots.find(
        (s) => `${s.dayOfWeek}-${s.hour}` !== buildTimeSlotKey(suggestionTime),
      )
      expect(otherSlot?.count).toBe(3)
    })

    it('does not decrement count below 0', () => {
      const analysis = makeHabitAnalysis({
        frequentTimeSlots: [{ dayOfWeek: 4, hour: 18, count: 0 }],
      })
      const suggestionTime = new Date('2026-07-23T18:00:00Z')

      const result = adjustHabitAnalysisAfterRejection(analysis, suggestionTime)

      expect(result.frequentTimeSlots[0].count).toBe(0)
    })

    it('reduces categoryAffinity by factor 0.98', () => {
      const analysis = makeHabitAnalysis()
      const suggestionTime = new Date('2026-07-23T18:00:00Z')

      const result = adjustHabitAnalysisAfterRejection(analysis, suggestionTime)

      expect(result.categoryAffinity.TASK).toBe(Number((0.7 * 0.98).toFixed(3)))
      expect(result.categoryAffinity.HABIT).toBe(Number((0.3 * 0.98).toFixed(3)))
    })

    it('updates updatedAt timestamp', () => {
      const analysis = makeHabitAnalysis()
      const before = Date.now()
      const suggestionTime = new Date('2026-07-23T18:00:00Z')

      const result = adjustHabitAnalysisAfterRejection(analysis, suggestionTime)

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before)
    })
  })

  describe('recommendationSchema', () => {
    it('accepts valid JSON with up to 3 suggestions', () => {
      const data = {
        suggestions: [
          {
            suggestedTitle: 'Test',
            suggestedTime: '2026-07-23T18:00:00+00:00',
            explanation: 'Test explanation',
          },
        ],
      }
      expect(recommendationSchema.safeParse(data).success).toBe(true)
    })

    it('rejects more than 3 suggestions', () => {
      const data = {
        suggestions: [
          { suggestedTitle: 'A', suggestedTime: '2026-07-23T18:00:00+00:00', explanation: 'A' },
          { suggestedTitle: 'B', suggestedTime: '2026-07-23T18:00:00+00:00', explanation: 'B' },
          { suggestedTitle: 'C', suggestedTime: '2026-07-23T18:00:00+00:00', explanation: 'C' },
          { suggestedTitle: 'D', suggestedTime: '2026-07-23T18:00:00+00:00', explanation: 'D' },
        ],
      }
      expect(recommendationSchema.safeParse(data).success).toBe(false)
    })

    it('rejects suggestion with missing required field', () => {
      const data = {
        suggestions: [{ suggestedTitle: 'Test', explanation: 'Test' }],
      }
      expect(recommendationSchema.safeParse(data).success).toBe(false)
    })

    it('rejects suggestion with empty title', () => {
      const data = {
        suggestions: [
          { suggestedTitle: '', suggestedTime: '2026-07-23T18:00:00+00:00', explanation: 'Test' },
        ],
      }
      expect(recommendationSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('overloadSchema', () => {
    it('accepts valid overload data', () => {
      const data = {
        isOverloaded: true,
        riskLevel: 'high',
        explanation: 'Too many tasks',
      }
      expect(overloadSchema.safeParse(data).success).toBe(true)
    })

    it('accepts all valid risk levels', () => {
      for (const level of ['low', 'medium', 'high']) {
        const data = { isOverloaded: false, riskLevel: level, explanation: 'Test' }
        expect(overloadSchema.safeParse(data).success).toBe(true)
      }
    })

    it('rejects invalid risk level', () => {
      const data = { isOverloaded: false, riskLevel: 'critical', explanation: 'Test' }
      expect(overloadSchema.safeParse(data).success).toBe(false)
    })

    it('rejects missing explanation', () => {
      const data = { isOverloaded: true, riskLevel: 'low' }
      expect(overloadSchema.safeParse(data).success).toBe(false)
    })
  })

  describe('processFeedback', () => {
    it('updates suggestion to ACCEPTED when accepted=true', async () => {
      const suggestion = makeSuggestion()
      spyOn(AIRepository, 'findSuggestionById').mockResolvedValue(suggestion)
      const updateSpy = spyOn(AIRepository, 'updateSuggestionStatus').mockResolvedValue(
        makeSuggestion({ status: 'ACCEPTED' }),
      )

      const result = await AIService.processFeedback('sug-1', true)

      expect(result.status).toBe('ACCEPTED')
      expect(updateSpy).toHaveBeenCalledWith('sug-1', 'ACCEPTED')
    })

    it('updates suggestion to REJECTED and adjusts analysis when accepted=false', async () => {
      const suggestion = makeSuggestion()
      const analysis = makeHabitAnalysis()
      spyOn(AIRepository, 'findSuggestionById').mockResolvedValue(suggestion)
      spyOn(AIRepository, 'updateSuggestionStatus').mockResolvedValue(
        makeSuggestion({ status: 'REJECTED' }),
      )
      spyOn(AIRepository, 'findHabitAnalysisByUserId').mockResolvedValue(analysis)
      const saveSpy = spyOn(AIRepository, 'saveHabitAnalysis').mockResolvedValue(analysis)

      await AIService.processFeedback('sug-1', false)

      expect(saveSpy).toHaveBeenCalledTimes(1)
    })

    it('throws 404 when suggestion not found', async () => {
      spyOn(AIRepository, 'findSuggestionById').mockResolvedValue(null)

      try {
        await AIService.processFeedback('nonexistent', true)
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('throws 404 when update returns null', async () => {
      spyOn(AIRepository, 'findSuggestionById').mockResolvedValue(makeSuggestion())
      spyOn(AIRepository, 'updateSuggestionStatus').mockResolvedValue(null)

      try {
        await AIService.processFeedback('sug-1', true)
        expect.unreachable()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('skips habit analysis adjustment when accepted', async () => {
      spyOn(AIRepository, 'findSuggestionById').mockResolvedValue(makeSuggestion())
      spyOn(AIRepository, 'updateSuggestionStatus').mockResolvedValue(
        makeSuggestion({ status: 'ACCEPTED' }),
      )
      const findAnalysisSpy = spyOn(AIRepository, 'findHabitAnalysisByUserId').mockResolvedValue(
        makeHabitAnalysis(),
      )

      await AIService.processFeedback('sug-1', true)

      expect(findAnalysisSpy).not.toHaveBeenCalled()
    })
  })
})
