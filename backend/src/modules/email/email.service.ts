import nodemailer from 'nodemailer'
import { env } from '../../config/env'
import { renderPasswordResetEmail } from './password-reset-email'

const getEmailConfig = () => {
  const required = [env.APP_BASE_URL, env.SMTP_HOST, env.SMTP_PORT, env.EMAIL_FROM_ADDRESS]

  if (required.some((value) => !value)) {
    throw new Error('Password recovery email is not configured')
  }

  const port = Number(env.SMTP_PORT)
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('SMTP_PORT must be a valid port number')
  }

  return {
    appBaseUrl: env.APP_BASE_URL!,
    host: env.SMTP_HOST!,
    port,
    secure: env.SMTP_SECURE === 'true',
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.EMAIL_FROM_NAME
      ? `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS!}>`
      : env.EMAIL_FROM_ADDRESS!,
  }
}

export abstract class EmailService {
  static getPasswordResetUrl(token: string) {
    const { appBaseUrl } = getEmailConfig()
    const url = new URL('/reset-password', appBaseUrl)
    url.searchParams.set('token', token)
    return url.toString()
  }

  static async sendPasswordReset(to: string, token: string) {
    const config = getEmailConfig()
    const resetUrl = this.getPasswordResetUrl(token)
    const email = renderPasswordResetEmail(resetUrl)
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: !config.secure && Boolean(config.user && config.password),
      ...(config.user && config.password
        ? { auth: { user: config.user, pass: config.password } }
        : {}),
    })

    await transport.sendMail({
      from: config.from,
      to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
  }
}
