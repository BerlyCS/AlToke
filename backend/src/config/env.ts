const readRequiredEnv = (name: 'DATABASE_URL' | 'JWT_SECRET') => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const readOptionalEnv = (name: 'GOOGLE_CLIENT_ID') => {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : undefined
}

export const env = {
  DATABASE_URL: readRequiredEnv('DATABASE_URL'),
  JWT_SECRET: readRequiredEnv('JWT_SECRET'),
  GOOGLE_CLIENT_ID: readOptionalEnv('GOOGLE_CLIENT_ID'),
} as const

export type AppEnv = typeof env
