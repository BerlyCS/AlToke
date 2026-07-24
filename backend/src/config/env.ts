const readRequiredEnv = (name: 'DATABASE_URL' | 'JWT_SECRET') => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const readOptionalEnv = (
  name:
    | 'GOOGLE_CLIENT_ID'
    | 'APP_BASE_URL'
    | 'SMTP_HOST'
    | 'SMTP_PORT'
    | 'SMTP_SECURE'
    | 'SMTP_USER'
    | 'SMTP_PASSWORD'
    | 'EMAIL_FROM_ADDRESS'
    | 'EMAIL_FROM_NAME',
) => {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : undefined
}

export const env = {
  DATABASE_URL: readRequiredEnv('DATABASE_URL'),
  JWT_SECRET: readRequiredEnv('JWT_SECRET'),
  GOOGLE_CLIENT_ID: readOptionalEnv('GOOGLE_CLIENT_ID'),
  APP_BASE_URL: readOptionalEnv('APP_BASE_URL'),
  SMTP_HOST: readOptionalEnv('SMTP_HOST'),
  SMTP_PORT: readOptionalEnv('SMTP_PORT'),
  SMTP_SECURE: readOptionalEnv('SMTP_SECURE'),
  SMTP_USER: readOptionalEnv('SMTP_USER'),
  SMTP_PASSWORD: readOptionalEnv('SMTP_PASSWORD'),
  EMAIL_FROM_ADDRESS: readOptionalEnv('EMAIL_FROM_ADDRESS'),
  EMAIL_FROM_NAME: readOptionalEnv('EMAIL_FROM_NAME'),
} as const

export type AppEnv = typeof env
