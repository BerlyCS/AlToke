import { sql } from 'drizzle-orm'
import { db } from '../index'

export async function cleanDatabase() {
  console.log('🧹 Cleaning database...')

  await db.execute(sql`TRUNCATE TABLE users CASCADE`)
  await db.execute(sql`TRUNCATE TABLE achievements CASCADE`)
  await db.execute(sql`TRUNCATE TABLE items CASCADE`)

  console.log('Database cleaned')
}
