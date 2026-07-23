import { describe, expect, it } from 'bun:test'
import { renderPasswordResetEmail } from '../../../../src/modules/email/password-reset-email'

describe('password reset email', () => {
  it('renders a responsive HTML email and a plain-text fallback', () => {
    const resetUrl = 'https://altoke.qzz.io/reset-password?token=a&next=<script>'
    const email = renderPasswordResetEmail(resetUrl)

    expect(email.subject).toBe('Restablece tu contraseña de AlToke')
    expect(email.text).toContain(resetUrl)
    expect(email.html).toContain('width="100%"')
    expect(email.html).toContain('Restablecer contraseña')
    expect(email.html).toContain('token=a&amp;next=&lt;script&gt;')
    expect(email.html).not.toContain('token=a&next=<script>')
  })
})
