import { t, type UnwrapSchema } from 'elysia'

export const SendRequestParams = t.Object({
  addresseeId: t.String(),
})

export const AcceptRequestParams = t.Object({
  friendshipId: t.String(),
})

export const SearchQuery = t.Object({
  query: t.String(),
})

export const FriendProfile = t.Object({
  id: t.String(),
  nickname: t.Union([t.String(), t.Null()]),
  avatarUrl: t.Union([t.String(), t.Null()]),
  level: t.Number(),
  xp: t.Optional(t.Number()),
  currentStreak: t.Optional(t.Number()),
})

export const FriendshipEntry = t.Object({
  friendshipId: t.String(),
  friend: FriendProfile,
})

export const PendingRequest = t.Object({
  id: t.String(),
  requesterId: t.String(),
  addresseeId: t.String(),
  status: t.String(),
  createdAt: t.Date(),
  requester: FriendProfile,
})

export const FriendsResponse = t.Array(FriendshipEntry)
export const PendingRequestsResponse = t.Array(PendingRequest)
export const SearchUsersResponse = t.Array(FriendProfile)

export type SendRequestParams = UnwrapSchema<typeof SendRequestParams>
export type AcceptRequestParams = UnwrapSchema<typeof AcceptRequestParams>
export type SearchQuery = UnwrapSchema<typeof SearchQuery>

export const FriendshipModel = {
  sendRequestParams: SendRequestParams,
  acceptRequestParams: AcceptRequestParams,
  searchQuery: SearchQuery,
  friendsResponse: FriendsResponse,
  pendingRequestsResponse: PendingRequestsResponse,
  searchUsersResponse: SearchUsersResponse,
} as const
