import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { tags } from '../../../db/schema'
import type { TagModel } from '../model'

export abstract class TagRepository {
  static async create(userId: string, data: TagModel['createTagBody']) {
    const [tag] = await db
      .insert(tags)
      .values({
        userId,
        name: data.name,
        color: data.color,
        icon: data.icon,
      })
      .returning()
    return tag
  }

  static async findAll(userId: string) {
    return await db.select().from(tags).where(eq(tags.userId, userId))
  }

  static async findById(userId: string, tagId: string) {
    const [tag] = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .limit(1)
    return tag || null
  }

  static async update(userId: string, tagId: string, data: TagModel['updateTagBody']) {
    const [tag] = await db
      .update(tags)
      .set(data)
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .returning()
    return tag || null
  }

  static async delete(userId: string, tagId: string) {
    const [tag] = await db
      .delete(tags)
      .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
      .returning()
    return tag || null
  }
}
