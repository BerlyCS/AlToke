import { type UnwrapSchema } from 'elysia'

export * from './requests'
export * from './responses'

import { ProfileUpdateBody, PrivacyUpdateBody, ProfileParams } from './requests'
import {
	PrivacyResponse,
	ProfileResponse,
	PublicProfileResponse,
	UnauthorizedResponse,
	UserNotFoundResponse,
} from './responses'

export const UserModel = {
	updateProfileBody: ProfileUpdateBody,
	updatePrivacyBody: PrivacyUpdateBody,
	profileParams: ProfileParams,
	privacyResponse: PrivacyResponse,
	profileResponse: ProfileResponse,
	publicProfileResponse: PublicProfileResponse,
	unauthorizedError: UnauthorizedResponse,
	userError: UserNotFoundResponse,
} as const

export type UserModel = {
	updateProfileBody: UnwrapSchema<typeof ProfileUpdateBody>
	updatePrivacyBody: UnwrapSchema<typeof PrivacyUpdateBody>
	profileParams: UnwrapSchema<typeof ProfileParams>
	privacyResponse: UnwrapSchema<typeof PrivacyResponse>
	profileResponse: UnwrapSchema<typeof ProfileResponse>
	publicProfileResponse: UnwrapSchema<typeof PublicProfileResponse>
	unauthorizedError: UnwrapSchema<typeof UnauthorizedResponse>
	userError: UnwrapSchema<typeof UserNotFoundResponse>
}
