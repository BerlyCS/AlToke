import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { FriendshipService } from '../../../../src/modules/friendship/services/friendship.service'
import { FriendshipRepository } from '../../../../src/modules/friendship/repositories/friendship.repository'
import { NotificationService } from '../../../../src/modules/notification/services'

describe('FriendshipService', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('sendRequest', () => {
    it('throws 400 when sending request to yourself', async () => {
      try {
        await FriendshipService.sendRequest('user-1', 'user-1')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(400)
        expect((error as { response?: unknown }).response).toBe('Cannot send friendship request to yourself')
      }
    })

    it('throws 400 when friendship already exists', async () => {
      spyOn(FriendshipRepository, 'findExistingFriendship').mockResolvedValue({
        id: 'fs-1',
        requesterId: 'user-1',
        addresseeId: 'user-2',
        status: 'PENDING',
      } as any)

      try {
        await FriendshipService.sendRequest('user-1', 'user-2')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(400)
        expect((error as { response?: unknown }).response).toBe('Friendship or request already exists')
      }
    })

    it('creates request when no existing friendship', async () => {
      spyOn(FriendshipRepository, 'findExistingFriendship').mockResolvedValue(null as any)
      const sendSpy = spyOn(FriendshipRepository, 'sendRequest').mockResolvedValue({
        id: 'fs-new',
        requesterId: 'user-1',
        addresseeId: 'user-2',
        status: 'PENDING',
      } as any)

      const result = await FriendshipService.sendRequest('user-1', 'user-2')

      expect(sendSpy).toHaveBeenCalledWith('user-1', 'user-2')
      expect(result.id).toBe('fs-new')
      expect(result.status).toBe('PENDING')
    })
  })

  describe('acceptRequest', () => {
    it('throws 404 when request not found', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([])

      try {
        await FriendshipService.acceptRequest('user-2', 'fs-1')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('Friendship request not found or unauthorized')
      }
    })

    it('throws 404 when request belongs to different user', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([])

      try {
        await FriendshipService.acceptRequest('user-3', 'fs-1')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
      }
    })

    it('accepts request and sends notification', async () => {
      const pendingRequest = {
        id: 'fs-1',
        requesterId: 'user-1',
        addresseeId: 'user-2',
        status: 'PENDING',
        requester: { id: 'user-1', nickname: 'Alice', avatarUrl: null, level: 3 },
      }
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([pendingRequest] as any)
      const updateSpy = spyOn(FriendshipRepository, 'updateStatus').mockResolvedValue({
        id: 'fs-1',
        requesterId: 'user-1',
        addresseeId: 'user-2',
        status: 'ACCEPTED',
      } as any)
      spyOn(NotificationService, 'recordNotification').mockResolvedValue({} as any)

      const result = await FriendshipService.acceptRequest('user-2', 'fs-1')

      expect(updateSpy).toHaveBeenCalledWith('fs-1', 'ACCEPTED')
      expect(result.status).toBe('ACCEPTED')
    })

    it('sends FRIEND_ACCEPTED notification to requester', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([
        {
          id: 'fs-1',
          requesterId: 'user-1',
          addresseeId: 'user-2',
          status: 'PENDING',
          requester: { id: 'user-1', nickname: 'Alice', avatarUrl: null, level: 3 },
        },
      ] as any)
      spyOn(FriendshipRepository, 'updateStatus').mockResolvedValue({
        id: 'fs-1',
        requesterId: 'user-1',
        addresseeId: 'user-2',
        status: 'ACCEPTED',
      } as any)
      const notifySpy = spyOn(NotificationService, 'recordNotification').mockResolvedValue({} as any)

      await FriendshipService.acceptRequest('user-2', 'fs-1')

      expect(notifySpy).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'FRIEND_ACCEPTED',
        title: 'Solicitud de amistad aceptada',
        message: 'Alice aceptó tu solicitud de amistad',
      })
    })

    it('uses fallback nickname when requester has no nickname', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([
        {
          id: 'fs-1',
          requesterId: 'user-1',
          addresseeId: 'user-2',
          status: 'PENDING',
          requester: { id: 'user-1', nickname: null, avatarUrl: null, level: 1 },
        },
      ] as any)
      spyOn(FriendshipRepository, 'updateStatus').mockResolvedValue({
        id: 'fs-1',
        requesterId: 'user-1',
        status: 'ACCEPTED',
      } as any)
      const notifySpy = spyOn(NotificationService, 'recordNotification').mockResolvedValue({} as any)

      await FriendshipService.acceptRequest('user-2', 'fs-1')

      expect(notifySpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Un usuario aceptó tu solicitud de amistad' }),
      )
    })
  })

  describe('rejectRequest', () => {
    it('throws 404 when request not found', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([])

      try {
        await FriendshipService.rejectRequest('user-2', 'fs-1')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('Friendship request not found or unauthorized')
      }
    })

    it('rejects request when found', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([
        {
          id: 'fs-1',
          requesterId: 'user-1',
          addresseeId: 'user-2',
          status: 'PENDING',
          requester: { id: 'user-1', nickname: 'Bob' },
        },
      ] as any)
      const updateSpy = spyOn(FriendshipRepository, 'updateStatus').mockResolvedValue({
        id: 'fs-1',
        requesterId: 'user-1',
        addresseeId: 'user-2',
        status: 'REJECTED',
      } as any)

      const result = await FriendshipService.rejectRequest('user-2', 'fs-1')

      expect(updateSpy).toHaveBeenCalledWith('fs-1', 'REJECTED')
      expect(result.status).toBe('REJECTED')
    })

    it('does not send notification on reject', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([
        {
          id: 'fs-1',
          requesterId: 'user-1',
          addresseeId: 'user-2',
          status: 'PENDING',
          requester: { id: 'user-1', nickname: 'Bob' },
        },
      ] as any)
      spyOn(FriendshipRepository, 'updateStatus').mockResolvedValue({
        id: 'fs-1',
        status: 'REJECTED',
      } as any)
      const notifySpy = spyOn(NotificationService, 'recordNotification').mockResolvedValue({} as any)

      await FriendshipService.rejectRequest('user-2', 'fs-1')

      expect(notifySpy).not.toHaveBeenCalled()
    })
  })

  describe('removeFriend', () => {
    it('throws 404 when friendship not in friends list', async () => {
      spyOn(FriendshipRepository, 'getFriends').mockResolvedValue([])

      try {
        await FriendshipService.removeFriend('user-1', 'fs-1')
        expect.unreachable()
      } catch (error) {
        expect((error as { code?: number }).code).toBe(404)
        expect((error as { response?: unknown }).response).toBe('Friendship not found or unauthorized')
      }
    })

    it('deletes friendship when found in friends list', async () => {
      spyOn(FriendshipRepository, 'getFriends').mockResolvedValue([
        {
          friendshipId: 'fs-1',
          friend: { id: 'user-2', nickname: 'Alice', avatarUrl: null, level: 2, xp: 100, currentStreak: 3 },
        },
      ] as any)
      const deleteSpy = spyOn(FriendshipRepository, 'deleteFriendship').mockResolvedValue()

      const result = await FriendshipService.removeFriend('user-1', 'fs-1')

      expect(deleteSpy).toHaveBeenCalledWith('fs-1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('getPendingRequests', () => {
    it('delegates to repository', async () => {
      const pending = [
        {
          id: 'fs-1',
          requesterId: 'user-1',
          addresseeId: 'user-2',
          status: 'PENDING',
          requester: { id: 'user-1', nickname: 'Alice' },
        },
      ]
      const spy = spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue(pending as any)

      const result = await FriendshipService.getPendingRequests('user-2')

      expect(spy).toHaveBeenCalledWith('user-2')
      expect(result).toEqual(pending as any)
    })

    it('returns empty array when no pending requests', async () => {
      spyOn(FriendshipRepository, 'getPendingIncomingRequests').mockResolvedValue([])

      const result = await FriendshipService.getPendingRequests('user-2')

      expect(result).toEqual([])
    })
  })

  describe('getFriends', () => {
    it('delegates to repository', async () => {
      const friends = [
        {
          friendshipId: 'fs-1',
          friend: { id: 'user-2', nickname: 'Alice', avatarUrl: null, level: 3, xp: 300, currentStreak: 5 },
        },
      ]
      const spy = spyOn(FriendshipRepository, 'getFriends').mockResolvedValue(friends as any)

      const result = await FriendshipService.getFriends('user-1')

      expect(spy).toHaveBeenCalledWith('user-1')
      expect(result).toEqual(friends)
    })

    it('returns empty array when no friends', async () => {
      spyOn(FriendshipRepository, 'getFriends').mockResolvedValue([])

      const result = await FriendshipService.getFriends('user-1')

      expect(result).toEqual([])
    })
  })

  describe('searchUsers', () => {
    it('returns empty array for empty query', async () => {
      const spy = spyOn(FriendshipRepository, 'searchUsers').mockResolvedValue([])

      const result = await FriendshipService.searchUsers('', 'user-1')

      expect(spy).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('returns empty array for whitespace-only query', async () => {
      const spy = spyOn(FriendshipRepository, 'searchUsers').mockResolvedValue([])

      const result = await FriendshipService.searchUsers('   ', 'user-1')

      expect(spy).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('trims query and delegates to repository', async () => {
      const users = [{ id: 'user-2', nickname: 'Alice', avatarUrl: null, level: 3 }]
      const spy = spyOn(FriendshipRepository, 'searchUsers').mockResolvedValue(users as any)

      const result = await FriendshipService.searchUsers('  Alice  ', 'user-1')

      expect(spy).toHaveBeenCalledWith('Alice', 'user-1')
      expect(result).toEqual(users)
    })
  })
})
