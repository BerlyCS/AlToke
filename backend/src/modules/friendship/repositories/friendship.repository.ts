import { eq, or, and, ne, ilike } from 'drizzle-orm'
import { db } from '../../../db'
import { friendships, users } from '../../../db/schema'

export class FriendshipRepository {
  static async sendRequest(requesterId: string, addresseeId: string) {
    const [request] = await db
      .insert(friendships)
      .values({
        requesterId,
        addresseeId,
        status: 'PENDING',
      })
      .returning()
    return request
  }

  static async findExistingFriendship(user1: string, user2: string) {
    const [existing] = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, user1), eq(friendships.addresseeId, user2)),
          and(eq(friendships.requesterId, user2), eq(friendships.addresseeId, user1)),
        ),
      )
      .limit(1)
    return existing || null
  }

  static async updateStatus(id: string, status: 'ACCEPTED' | 'REJECTED') {
    const [updated] = await db
      .update(friendships)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendships.id, id))
      .returning()
    return updated || null
  }

  static async deleteFriendship(id: string) {
    await db.delete(friendships).where(eq(friendships.id, id))
  }

  static async getPendingIncomingRequests(userId: string) {
    return await db.query.friendships.findMany({
      where: and(eq(friendships.addresseeId, userId), eq(friendships.status, 'PENDING')),
      with: {
        requester: {
          columns: {
            id: true,
            nickname: true,
            avatarUrl: true,
            level: true,
          },
        },
      },
      orderBy: (fs, { desc }) => [desc(fs.createdAt)],
    })
  }

  static async getFriends(userId: string) {
    const allFriendships = await db.query.friendships.findMany({
      where: and(
        eq(friendships.status, 'ACCEPTED'),
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      ),
      with: {
        requester: {
          columns: {
            id: true,
            nickname: true,
            avatarUrl: true,
            level: true,
            xp: true,
            currentStreak: true,
          },
        },
        addressee: {
          columns: {
            id: true,
            nickname: true,
            avatarUrl: true,
            level: true,
            xp: true,
            currentStreak: true,
          },
        },
      },
    })

    return allFriendships.map((f) => {
      const friend = f.requesterId === userId ? f.addressee : f.requester
      return {
        friendshipId: f.id,
        friend,
      }
    })
  }

  static async searchUsers(query: string, excludeUserId: string) {
    return await db
      .select({
        id: users.id,
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
        level: users.level,
      })
      .from(users)
      .where(and(ne(users.id, excludeUserId), ilike(users.nickname, `%${query}%`)))
      .limit(10)
  }
}
