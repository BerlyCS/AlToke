import { db } from '../index'
import { friendships } from '../schema'
import type { users } from '../schema'
import type { InferSelectModel } from 'drizzle-orm'

type User = InferSelectModel<typeof users>

export async function seedFriendships(createdUsers: User[]) {
  console.log('Seeding friendships...')

  if (createdUsers.length < 3) return

  const friendshipsData: any[] = []

  for (let i = 0; i < createdUsers.length; i++) {
    const requester = createdUsers[i]
    const numFriendships = Math.floor(Math.random() * 3) + 2

    const potentialFriends = createdUsers.filter((u) => u.id !== requester.id)
    const shuffled = potentialFriends.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, numFriendships)

    for (const friend of selected) {
      const exists = friendshipsData.some(
        (f) =>
          (f.requesterId === requester.id && f.addresseeId === friend.id) ||
          (f.requesterId === friend.id && f.addresseeId === requester.id),
      )

      if (!exists) {
        friendshipsData.push({
          requesterId: requester.id,
          addresseeId: friend.id,
          status: Math.random() > 0.4 ? 'ACCEPTED' : 'PENDING',
        })
      }
    }
  }

  await db.insert(friendships).values(friendshipsData as any)

  console.log('Friendships seeded')
}
