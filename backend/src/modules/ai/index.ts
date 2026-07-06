/**
 * AI Module
 * Introduces artificial intelligence capabilities to combat procrastination.
 * Features: Performance analysis, execution time suggestions, workload prediction, re-prioritization
 */

import { Elysia } from 'elysia'
import { aiController } from './controllers'

export * from './domain'
export * from './dto'
export * from './services'
export * from './repositories'
export * from './controllers'

export const aiModule = new Elysia().use(aiController)
