import { describe, expect, it, beforeAll, afterAll } from 'bun:test'
import { db } from '../../../../../src/db'
import { sql } from 'drizzle-orm'
import { checkDueTasks } from '../../../../../src/modules/notification/services/due-task-checker'

const databaseAvailable = await db
  .execute(sql`select 1`)
  .then(() => true)
  .catch(() => false)

const TEST_PREFIX = 'due-checker-test-'

describe.skipIf(!databaseAvailable)('checkDueTasks', () => {
  let testUserId: string

  const insertTask = async (
    overrides: {
      title?: string
      dueDate?: string
      startDate?: string
      status?: string
      deletedAt?: string
    } = {},
  ) => {
    const result = await db.execute(sql`
      INSERT INTO tasks (id, user_id, title, type, priority, status, due_date, start_date, deleted_at)
      VALUES (
        gen_random_uuid(),
        ${testUserId},
        ${overrides.title ?? 'Test Task'},
        'TASK',
        'MEDIUM',
        ${overrides.status ?? 'PENDING'},
        ${overrides.dueDate ? sql.raw(overrides.dueDate) : sql`NULL`},
        ${overrides.startDate ? sql.raw(overrides.startDate) : sql`NULL`},
        ${overrides.deletedAt ? sql.raw(overrides.deletedAt) : sql`NULL`}
      )
      RETURNING id
    `)
    return result[0]?.id as string
  }

  const countNotifications = async (typePrefix: string) => {
    const result = await db.execute(sql`
      SELECT count(*)::int AS count FROM notification_logs
      WHERE user_id = ${testUserId} AND type LIKE ${typePrefix + ':%'}
    `)
    return result[0]?.count as number
  }

  const cleanNotifications = async () => {
    await db.execute(sql`DELETE FROM notification_logs WHERE user_id = ${testUserId}`)
  }

  const cleanTasks = async () => {
    await db.execute(sql`DELETE FROM tasks WHERE user_id = ${testUserId}`)
  }

  beforeAll(async () => {
    await db.execute(sql`DELETE FROM users WHERE email LIKE ${TEST_PREFIX + '%'}`)
    await db.execute(sql`DELETE FROM notification_logs WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE ${TEST_PREFIX + '%'}
    )`)
    await db.execute(sql`DELETE FROM tasks WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE ${TEST_PREFIX + '%'}
    )`)

    const result = await db.execute(sql`
      INSERT INTO users (id, email, password_hash, nickname, role)
      VALUES (gen_random_uuid(), ${TEST_PREFIX + Date.now() + '@test.com'}, 'hash', 'DueChecker User', 'USER')
      RETURNING id
    `)
    testUserId = result[0]?.id as string
  })

  afterAll(async () => {
    await cleanNotifications()
    await cleanTasks()
    await db.execute(sql`DELETE FROM privacy_settings WHERE user_id = ${testUserId}`)
    await db.execute(sql`DELETE FROM users WHERE id = ${testUserId}`)
  })

  it('returns 0 when there are no matching tasks', async () => {
    await cleanTasks()
    const count = await checkDueTasks()
    expect(count).toBe(0)
  })

  it('detects a task that is already due (dueDate <= now)', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Already Due',
      dueDate: "NOW() - interval '30 seconds'",
    })

    const count = await checkDueTasks()
    expect(count).toBe(1)

    const notifCount = await countNotifications('TASK_DUE')
    expect(notifCount).toBe(1)
  })

  it('detects a task due soon (dueDate between now and +5min)', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Due Soon',
      dueDate: "NOW() + interval '3 minutes'",
    })

    const count = await checkDueTasks()
    expect(count).toBe(1)

    const notifCount = await countNotifications('TASK_DUE_SOON')
    expect(notifCount).toBe(1)
  })

  it('detects a task with startDate reached', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Start Time Reached',
      startDate: "NOW() - interval '20 seconds'",
    })

    const count = await checkDueTasks()
    expect(count).toBe(1)

    const notifCount = await countNotifications('TASK_TIME_REACHED')
    expect(notifCount).toBe(1)
  })

  it('ignores completed tasks', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Completed Task',
      dueDate: "NOW() - interval '10 seconds'",
      status: 'COMPLETED',
    })

    const count = await checkDueTasks()
    expect(count).toBe(0)
  })

  it('ignores soft-deleted tasks', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Deleted Task',
      dueDate: "NOW() - interval '10 seconds'",
      deletedAt: 'NOW()',
    })

    const count = await checkDueTasks()
    expect(count).toBe(0)
  })

  it('does not duplicate notifications on repeated calls', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Duplicate Check',
      dueDate: "NOW() - interval '15 seconds'",
    })

    await checkDueTasks()
    await checkDueTasks()

    const notifCount = await countNotifications('TASK_DUE')
    expect(notifCount).toBe(1)
  })

  it('handles multiple tasks and returns correct count', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Task A - Due',
      dueDate: "NOW() - interval '10 seconds'",
    })
    await insertTask({
      title: 'Task B - Due Soon',
      dueDate: "NOW() + interval '2 minutes'",
    })
    await insertTask({
      title: 'Task C - Start',
      startDate: "NOW() - interval '5 seconds'",
    })

    const count = await checkDueTasks()
    expect(count).toBe(3)
  })

  it('ignores tasks outside the time window', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Far Future',
      dueDate: "NOW() + interval '10 minutes'",
    })

    const count = await checkDueTasks()
    expect(count).toBe(0)
  })

  it('does not trigger TASK_DUE_SOON for past dueDate', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Past Due Not Soon',
      dueDate: "NOW() - interval '30 seconds'",
    })

    const count = await checkDueTasks()
    expect(count).toBe(1)

    const dueSoonCount = await countNotifications('TASK_DUE_SOON')
    expect(dueSoonCount).toBe(0)

    const dueCount = await countNotifications('TASK_DUE')
    expect(dueCount).toBe(1)
  })

  it('a task with both dueDate and startDate in range creates two notifications', async () => {
    await cleanTasks()
    await cleanNotifications()
    await insertTask({
      title: 'Both Dates',
      dueDate: "NOW() - interval '20 seconds'",
      startDate: "NOW() - interval '10 seconds'",
    })

    const count = await checkDueTasks()
    expect(count).toBe(2)

    const dueCount = await countNotifications('TASK_DUE')
    expect(dueCount).toBe(1)

    const startCount = await countNotifications('TASK_TIME_REACHED')
    expect(startCount).toBe(1)
  })
})
