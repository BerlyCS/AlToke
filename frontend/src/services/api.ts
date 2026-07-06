import { treaty } from '@elysiajs/eden'
import type {
  Achievement,
  CompleteTaskResult,
  Credentials,
  InventoryItem,
  LeaderboardEntry,
  PrivacyUpdateBody,
  ProfileUpdateBody,
  Tag,
  Task,
  TaskOverloadPrediction,
  TaskSuggestion,
  UseItemResult,
  UserProfile,
} from '@/types'

type ApiResult<T> = Promise<{
  data: T | null
  error: { value: unknown } | null
  status: number
}>

type AuthHeaders = {
  headers?: {
    authorization?: string
  }
}

type AuthResponse = {
  user: {
    id: string
    email: string
    nickname: string | null
    avatarUrl?: string | null
  }
  token: string
}

type ApiClientContract = {
  api: {
    auth: {
      login: { post: (body: Credentials) => ApiResult<AuthResponse> }
      register: { post: (body: Credentials) => ApiResult<AuthResponse> }
      google: { post: (body: { idToken: string }) => ApiResult<AuthResponse> }
    }
    ai: {
      suggestions: {
        get: (options: AuthHeaders) => ApiResult<{ suggestions: TaskSuggestion[] }>
      } & ((params: { id: string }) => {
        feedback: {
          post: (body: { accepted: boolean }, options: AuthHeaders) => ApiResult<TaskSuggestion>
        }
      })
      overload: {
        get: (
          options: AuthHeaders & { query: { date: string } },
        ) => ApiResult<TaskOverloadPrediction>
      }
    }
    tags: {
      get: (options: AuthHeaders) => ApiResult<Tag[]>
      post: (body: Partial<Tag>, options: AuthHeaders) => ApiResult<Tag>
    } & ((params: { id: string }) => {
      patch: (body: Partial<Tag>, options: AuthHeaders) => ApiResult<Tag>
      delete: (body: Record<string, never>, options: AuthHeaders) => ApiResult<Tag>
    })
    tasks: {
      get: (options: AuthHeaders) => ApiResult<Task[]>
      post: (body: Partial<Task>, options: AuthHeaders) => ApiResult<Task>
      trash: {
        get: (options: AuthHeaders) => ApiResult<Task[]>
      }
    } & ((params: { id: string }) => {
      patch: (body: Partial<Task>, options: AuthHeaders) => ApiResult<Task>
      delete: (body: Record<string, never>, options: AuthHeaders) => ApiResult<Task>
      complete: {
        patch: (body: Record<string, never>, options: AuthHeaders) => ApiResult<CompleteTaskResult>
      }
      restore: {
        patch: (body: Record<string, never>, options: AuthHeaders) => ApiResult<Task>
      }
    })
    gamification: {
      leaderboard: {
        get: (options: { query?: { limit?: number } }) => ApiResult<LeaderboardEntry[]>
      }
      achievements: {
        get: (options: AuthHeaders) => ApiResult<Achievement[]>
      }
      inventory: {
        get: (options: AuthHeaders) => ApiResult<InventoryItem[]>
        use: {
          post: (body: { itemId: string }, options: AuthHeaders) => ApiResult<UseItemResult>
        }
      }
    }
    users: {
      profile: {
        get: (options: AuthHeaders) => ApiResult<UserProfile>
        patch: (body: Partial<ProfileUpdateBody>, options: AuthHeaders) => ApiResult<UserProfile>
        privacy: {
          patch: (body: Partial<PrivacyUpdateBody>, options: AuthHeaders) => ApiResult<UserProfile>
        }
      }
    }
  }
}

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const baseUrl = rawUrl.startsWith('/') ? window.location.origin + rawUrl : rawUrl

export const api = treaty(baseUrl.replace(/\/api$/, '')) as unknown as ApiClientContract

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
