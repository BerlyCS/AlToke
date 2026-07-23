import { describe, expect, it } from 'bun:test'
import {
  ModerateProfileRequest,
  AssignTaskRequest,
  UsersQueryRequest,
} from '../../../../../src/modules/admin/dto/requests'
import {
  SystemMetricsResponse,
  BanUserResponse,
  ModerateProfileResponse,
  UsersResponse,
  TaskMeticsResponse,
  TopUsersResponse,
  PerformanceMetricsResponse,
  UserSummaryResponse,
} from '../../../../../src/modules/admin/dto/responses'

describe('Admin DTOs', () => {
  describe('ModerateProfileRequest', () => {
    it('is a valid Elysia schema object', () => {
      expect(ModerateProfileRequest).toBeDefined()
      expect(typeof ModerateProfileRequest).toBe('object')
    })

    it('has required type property', () => {
      expect(ModerateProfileRequest.type).toBe('object')
    })

    it('has required properties definition', () => {
      expect(ModerateProfileRequest.properties).toBeDefined()
      expect(ModerateProfileRequest.properties.nickname).toBeDefined()
      expect(ModerateProfileRequest.properties.bio).toBeDefined()
      expect(ModerateProfileRequest.properties.avatarUrl).toBeDefined()
      expect(ModerateProfileRequest.properties.reason).toBeDefined()
    })

    it('marks reason as required', () => {
      expect(ModerateProfileRequest.required).toContain('reason')
    })

    it('marks optional fields as not required', () => {
      expect(ModerateProfileRequest.required).not.toContain('nickname')
      expect(ModerateProfileRequest.required).not.toContain('bio')
      expect(ModerateProfileRequest.required).not.toContain('avatarUrl')
    })
  })

  describe('AssignTaskRequest', () => {
    it('is a valid Elysia schema object', () => {
      expect(AssignTaskRequest).toBeDefined()
      expect(AssignTaskRequest.type).toBe('object')
    })

    it('has taskId and reason properties', () => {
      expect(AssignTaskRequest.properties.taskId).toBeDefined()
      expect(AssignTaskRequest.properties.reason).toBeDefined()
    })

    it('marks taskId as required', () => {
      expect(AssignTaskRequest.required).toContain('taskId')
    })

    it('marks reason as not required', () => {
      expect(AssignTaskRequest.required).not.toContain('reason')
    })
  })

  describe('UsersQueryRequest', () => {
    it('is a valid Elysia schema object', () => {
      expect(UsersQueryRequest).toBeDefined()
      expect(UsersQueryRequest.type).toBe('object')
    })

    it('has limit and offset properties', () => {
      expect(UsersQueryRequest.properties.limit).toBeDefined()
      expect(UsersQueryRequest.properties.offset).toBeDefined()
    })

    it('has no required fields (all optional)', () => {
      expect(UsersQueryRequest.required).toBeUndefined()
    })
  })

  describe('BanUserResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(BanUserResponse).toBeDefined()
      expect(BanUserResponse.type).toBe('object')
    })

    it('has success, message, and userId properties', () => {
      expect(BanUserResponse.properties.success).toBeDefined()
      expect(BanUserResponse.properties.message).toBeDefined()
      expect(BanUserResponse.properties.userId).toBeDefined()
    })

    it('marks all fields as required', () => {
      expect(BanUserResponse.required).toContain('success')
      expect(BanUserResponse.required).toContain('message')
      expect(BanUserResponse.required).toContain('userId')
    })

    it('has correct types for each field', () => {
      expect(BanUserResponse.properties.success?.type).toBe('boolean')
      expect(BanUserResponse.properties.message?.type).toBe('string')
      expect(BanUserResponse.properties.userId?.type).toBe('string')
    })
  })

  describe('ModerateProfileResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(ModerateProfileResponse).toBeDefined()
      expect(ModerateProfileResponse.type).toBe('object')
    })

    it('has success, message, and userId properties', () => {
      expect(ModerateProfileResponse.properties.success).toBeDefined()
      expect(ModerateProfileResponse.properties.message).toBeDefined()
      expect(ModerateProfileResponse.properties.userId).toBeDefined()
    })

    it('marks all fields as required', () => {
      expect(ModerateProfileResponse.required).toContain('success')
      expect(ModerateProfileResponse.required).toContain('message')
      expect(ModerateProfileResponse.required).toContain('userId')
    })
  })

  describe('SystemMetricsResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(SystemMetricsResponse).toBeDefined()
      expect(SystemMetricsResponse.type).toBe('object')
    })

    it('has all metric properties', () => {
      expect(SystemMetricsResponse.properties.totalUsers).toBeDefined()
      expect(SystemMetricsResponse.properties.activeUsersDaily).toBeDefined()
      expect(SystemMetricsResponse.properties.tasksCompletedToday).toBeDefined()
      expect(SystemMetricsResponse.properties.totalTasks).toBeDefined()
    })

    it('marks all fields as required', () => {
      expect(SystemMetricsResponse.required).toContain('totalUsers')
      expect(SystemMetricsResponse.required).toContain('activeUsersDaily')
      expect(SystemMetricsResponse.required).toContain('tasksCompletedToday')
      expect(SystemMetricsResponse.required).toContain('totalTasks')
    })

    it('has number types for all fields', () => {
      expect(SystemMetricsResponse.properties.totalUsers?.type).toBe('number')
      expect(SystemMetricsResponse.properties.activeUsersDaily?.type).toBe('number')
      expect(SystemMetricsResponse.properties.tasksCompletedToday?.type).toBe('number')
      expect(SystemMetricsResponse.properties.totalTasks?.type).toBe('number')
    })
  })

  describe('UserSummaryResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(UserSummaryResponse).toBeDefined()
      expect(UserSummaryResponse.type).toBe('object')
    })

    it('has userId, level, xp, and createdAt as required', () => {
      expect(UserSummaryResponse.required).toContain('userId')
      expect(UserSummaryResponse.required).toContain('level')
      expect(UserSummaryResponse.required).toContain('xp')
      expect(UserSummaryResponse.required).toContain('createdAt')
    })

    it('marks nickname and lastActiveAt as not required', () => {
      expect(UserSummaryResponse.required).not.toContain('nickname')
      expect(UserSummaryResponse.required).not.toContain('lastActiveAt')
    })
  })

  describe('UsersResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(UsersResponse).toBeDefined()
      expect(UsersResponse.type).toBe('object')
    })

    it('has users, total, limit, and offset properties', () => {
      expect(UsersResponse.properties.users).toBeDefined()
      expect(UsersResponse.properties.total).toBeDefined()
      expect(UsersResponse.properties.limit).toBeDefined()
      expect(UsersResponse.properties.offset).toBeDefined()
    })

    it('marks all fields as required', () => {
      expect(UsersResponse.required).toContain('users')
      expect(UsersResponse.required).toContain('total')
      expect(UsersResponse.required).toContain('limit')
      expect(UsersResponse.required).toContain('offset')
    })

    it('users field is an array type', () => {
      expect(UsersResponse.properties.users?.type).toBe('array')
    })
  })

  describe('TaskMeticsResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(TaskMeticsResponse).toBeDefined()
      expect(TaskMeticsResponse.type).toBe('object')
    })

    it('has typeTask and totalTasks properties', () => {
      expect(TaskMeticsResponse.properties.typeTask).toBeDefined()
      expect(TaskMeticsResponse.properties.totalTasks).toBeDefined()
    })

    it('marks all fields as required', () => {
      expect(TaskMeticsResponse.required).toContain('typeTask')
      expect(TaskMeticsResponse.required).toContain('totalTasks')
    })

    it('typeTask is an array type', () => {
      expect(TaskMeticsResponse.properties.typeTask?.type).toBe('array')
    })
  })

  describe('TopUsersResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(TopUsersResponse).toBeDefined()
      expect(TopUsersResponse.type).toBe('object')
    })

    it('has users and totalUsers properties', () => {
      expect(TopUsersResponse.properties.users).toBeDefined()
      expect(TopUsersResponse.properties.totalUsers).toBeDefined()
    })

    it('marks all fields as required', () => {
      expect(TopUsersResponse.required).toContain('users')
      expect(TopUsersResponse.required).toContain('totalUsers')
    })

    it('users field is an array type', () => {
      expect(TopUsersResponse.properties.users?.type).toBe('array')
    })
  })

  describe('PerformanceMetricsResponse', () => {
    it('is a valid Elysia schema object', () => {
      expect(PerformanceMetricsResponse).toBeDefined()
      expect(PerformanceMetricsResponse.type).toBe('object')
    })

    it('has completionRate and totalXp properties', () => {
      expect(PerformanceMetricsResponse.properties.completionRate).toBeDefined()
      expect(PerformanceMetricsResponse.properties.totalXp).toBeDefined()
    })

    it('marks all fields as required', () => {
      expect(PerformanceMetricsResponse.required).toContain('completionRate')
      expect(PerformanceMetricsResponse.required).toContain('totalXp')
    })

    it('has number types for both fields', () => {
      expect(PerformanceMetricsResponse.properties.completionRate?.type).toBe('number')
      expect(PerformanceMetricsResponse.properties.totalXp?.type).toBe('number')
    })
  })
})
