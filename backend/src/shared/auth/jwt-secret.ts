import { env } from '../../config/env'

export const resolveJwtSecret = () => env.JWT_SECRET
