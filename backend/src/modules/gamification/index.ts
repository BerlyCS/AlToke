/**
 * Gamification Module
 * Applies game mechanics to encourage productivity.
 * Features: XP awards, level-ups, streaks, achievements, inventory
 */

import { Elysia } from 'elysia'
import { gamificationController } from './controllers'

// Domain
export * from './domain/index'

// DTOs
export * from './dto'

// Services
export * from './services'

// Repositories
export * from './repositories'

// Controllers
export * from './controllers'

export const gamificationModule = new Elysia().use(gamificationController)
