import * as schema from './schema'
import { spreads } from './utils'

export const dbModel = {
  insert: spreads(
    {
      users: schema.users,
      privacySettings: schema.privacySettings,
      tasks: schema.tasks,
      tags: schema.tags,
      taskTags: schema.taskTags,
    },
    'insert',
  ),
  select: spreads(
    {
      users: schema.users,
      privacySettings: schema.privacySettings,
      tasks: schema.tasks,
      tags: schema.tags,
      taskTags: schema.taskTags,
    },
    'select',
  ),
} as const
