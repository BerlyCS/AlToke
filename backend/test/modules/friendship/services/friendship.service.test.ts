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
})
