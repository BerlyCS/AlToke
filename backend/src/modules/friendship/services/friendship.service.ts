import { status } from 'elysia'
import { FriendshipRepository } from '../repositories/friendship.repository'

export class FriendshipService {
  static async sendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw status(400, 'Cannot send friendship request to yourself')
    }

    const existing = await FriendshipRepository.findExistingFriendship(requesterId, addresseeId)
    if (existing) {
      throw status(400, 'Friendship or request already exists')
    }

    return await FriendshipRepository.sendRequest(requesterId, addresseeId)
  }

  static async acceptRequest(userId: string, friendshipId: string) {
    // Find the request by looking up pending requests
    const pendingRequests = await FriendshipRepository.getPendingIncomingRequests(userId)
    const request = pendingRequests.find((req) => req.id === friendshipId)
    
    if (!request) {
      throw status(404, 'Friendship request not found or unauthorized')
    }

    return await FriendshipRepository.updateStatus(friendshipId, 'ACCEPTED')
  }

  static async rejectRequest(userId: string, friendshipId: string) {
    const pendingRequests = await FriendshipRepository.getPendingIncomingRequests(userId)
    const request = pendingRequests.find((req) => req.id === friendshipId)
    
    if (!request) {
      throw status(404, 'Friendship request not found or unauthorized')
    }

    return await FriendshipRepository.updateStatus(friendshipId, 'REJECTED')
  }

  static async removeFriend(userId: string, friendshipId: string) {
    // Basic authorization: user must be part of the friendship
    // For simplicity, we just delete it if the user is in the friends list.
    const friends = await FriendshipRepository.getFriends(userId)
    const isFriend = friends.find((f) => f.friendshipId === friendshipId)
    if (!isFriend) {
      throw status(404, 'Friendship not found or unauthorized')
    }

    await FriendshipRepository.deleteFriendship(friendshipId)
    return { success: true }
  }

  static async getPendingRequests(userId: string) {
    return await FriendshipRepository.getPendingIncomingRequests(userId)
  }

  static async getFriends(userId: string) {
    return await FriendshipRepository.getFriends(userId)
  }

  static async searchUsers(query: string, excludeUserId: string) {
    if (query.trim().length === 0) return []
    return await FriendshipRepository.searchUsers(query.trim(), excludeUserId)
  }
}
