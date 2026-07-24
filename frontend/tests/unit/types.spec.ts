import { describe, it, expect } from 'vitest'
import { mockProfile, mockAdminProfile, mockTask, mockTag, mockAchievement } from '../fixtures'

describe('Type fixtures', () => {
  it('mockTask has correct structure', () => {
    expect(mockTask.id).toBe('task-1')
    expect(mockTask.title).toBe('Terminar reporte')
    expect(mockTask.type).toBe('TASK')
    expect(mockTask.status).toBe('PENDING')
    expect(mockTask.priority).toBe('HIGH')
    expect(mockTask.tags).toHaveLength(1)
  })

  it('mockProfile has correct role', () => {
    expect(mockProfile.role).toBe('USER')
    expect(mockAdminProfile.role).toBe('ADMIN')
  })

  it('mockProfile has gamification data', () => {
    expect(mockProfile.xp).toBe(500)
    expect(mockProfile.level).toBe(5)
    expect(mockProfile.currentStreak).toBe(7)
    expect(mockProfile.maxStreak).toBe(14)
  })

  it('mockTag has correct structure', () => {
    expect(mockTag.id).toBe('tag-1')
    expect(mockTag.name).toBe('Trabajo')
    expect(mockTag.color).toBe('bg-blue-500')
    expect(mockTag.icon).toBe('Briefcase')
  })

  it('mockAchievement has correct structure', () => {
    expect(mockAchievement.id).toBe('ach-1')
    expect(mockAchievement.code).toBe('task-first')
    expect(mockAchievement.isSecret).toBe(false)
    expect(mockAchievement.unlockedAt).toBeDefined()
  })

  it('mock profile has privacy settings', () => {
    expect(mockProfile.privacy?.showLevel).toBe(true)
    expect(mockProfile.privacy?.showStreak).toBe(true)
    expect(mockProfile.privacy?.showAchievements).toBe(true)
  })
})
