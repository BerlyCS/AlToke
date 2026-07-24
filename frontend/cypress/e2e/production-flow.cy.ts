const apiUrl = '/api'
const password = 'E2e-password-123'
const resetPassword = 'E2e-reset-password-123'
const suffix = `${Date.now()}-${Cypress._.random(100000, 999999)}`
const primary = {
  email: `e2e-primary-${suffix}@altoke.test`,
  nickname: `E2E Primary ${suffix}`,
}
const friend = {
  email: `e2e-friend-${suffix}@altoke.test`,
  nickname: `E2E Friend ${suffix}`,
}

type AuthResponse = { token: string; user: { id: string } }

const register = (user: typeof primary): Cypress.Chainable<AuthResponse> =>
  cy.request('POST', `${apiUrl}/auth/register`, { ...user, password })

const login = (email: string, loginPassword = password): Cypress.Chainable<AuthResponse> =>
  cy.request('POST', `${apiUrl}/auth/login`, { email, password: loginPassword })

const authHeaders = (token: string) => ({ authorization: `Bearer ${token}` })

const loginThroughUi = () => {
  cy.visit('/login')
  cy.get('[data-cy="auth-email"]').type(primary.email)
  cy.get('[data-cy="auth-password"]').type(password)
  cy.get('[data-cy="auth-submit"]').click()
  cy.location('pathname').should('eq', '/dashboard')
}

const waitForResetEmail = (email: string, attempts = 20): Cypress.Chainable<string> => {
  return cy.request('http://localhost:8025/api/v1/messages').then((response) => {
    const message = response.body.messages?.find((entry: { To: Array<{ Address: string }> }) =>
      entry.To.some((recipient) => recipient.Address === email),
    )

    if (message) {
      return cy.request(`http://localhost:8025/api/v1/message/${message.ID}`).then((detail) => {
        const body = `${detail.body.Text ?? ''}\n${detail.body.HTML ?? ''}`
        const resetUrl = body.match(/http:\/\/localhost:\d+\/reset-password\?token=[^\s"<]+/)?.[0]
        if (!resetUrl) throw new Error('Password reset URL was not found in the Mailpit message')
        return resetUrl
      })
    }

    if (attempts <= 0) throw new Error('Mailpit did not receive the password reset email')
    return cy.wait(500).then(() => waitForResetEmail(email, attempts - 1))
  })
}

describe('production image end-to-end flow', () => {
  let primaryAuth: AuthResponse
  let friendAuth: AuthResponse

  before(() => {
    register(primary).then((response) => {
      primaryAuth = response.body
    })
    register(friend).then((response) => {
      friendAuth = response.body
    })
  })

  it('loads the application and rejects invalid credentials', () => {
    cy.visit('/login')
    cy.intercept('POST', `${apiUrl}/auth/login`).as('invalidLogin')
    cy.get('[data-cy="auth-email"]').type(primary.email)
    cy.get('[data-cy="auth-password"]').type('invalid-password')
    cy.get('[data-cy="auth-submit"]').click()
    cy.wait('@invalidLogin').its('response.statusCode').should('eq', 401)
  })

  it('logs in through the UI and updates the profile', () => {
    loginThroughUi()
    cy.visit('/configuracion')
    cy.get('#nickname').clear().type(`${primary.nickname} updated`)
    cy.contains('button', 'Guardar Cambios').click()
    cy.request({
      url: `${apiUrl}/users/profile`,
      headers: authHeaders(primaryAuth.token),
    })
      .its('body.nickname')
      .should('eq', `${primary.nickname} updated`)
  })

  it('creates, completes, deletes, and restores a task through the UI', () => {
    loginThroughUi()
    cy.visit('/tasks')
    cy.get('[data-cy="create-task"]').click()
    cy.get('[data-cy="task-form-dialog"]').should('be.visible')
    cy.get('[data-cy="task-title"]').type(`E2E task ${suffix}`)
    cy.get('[data-cy="task-description"]').type('Created by the production image E2E suite.')
    cy.get('[data-cy="task-estimated-time"]').type('30')
    cy.get('[data-cy="task-priority-high"]').click()
    cy.get('[data-cy="task-submit"]').click()
    cy.contains(`E2E task ${suffix}`).should('be.visible')
    cy.get('body').then(($body) => {
      const achievementDismiss = $body.find('button:contains("¡Genial!")')
      if (achievementDismiss.length) cy.wrap(achievementDismiss).click()
    })

    cy.request({ url: `${apiUrl}/tasks`, headers: authHeaders(primaryAuth.token) }).then(
      (response) => {
        const task = response.body.find(
          (entry: { title: string }) => entry.title === `E2E task ${suffix}`,
        )
        if (!task) throw new Error('Created task was not returned by the API')
        const taskId = task.id

        cy.get(`[data-cy="task-toggle-${taskId}"]`).click()
        cy.request({ url: `${apiUrl}/tasks/${taskId}`, headers: authHeaders(primaryAuth.token) })
          .its('body.status')
          .should('eq', 'COMPLETED')
        cy.contains('button', '¡Genial!', { timeout: 5000 }).click()

        cy.on('window:confirm', () => true)
        cy.get(`[data-cy="task-delete-${taskId}"]`).click()
        cy.get('[data-cy="trash-tab"]').click()
        cy.get(`[data-cy="trashed-task-${taskId}"]`).should('be.visible')
        cy.get(`[data-cy="task-restore-${taskId}"]`).click()
        cy.get('[data-cy="tasks-tab"]').click()
        cy.get(`[data-cy="task-row-${taskId}"]`).should('be.visible')
      },
    )
  })

  it('creates a friendship and exposes it in the friend leaderboard', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/friendships/request`,
      headers: authHeaders(primaryAuth.token),
      body: { addresseeId: friendAuth.user.id },
    })
    cy.request({
      url: `${apiUrl}/friendships/pending`,
      headers: authHeaders(friendAuth.token),
    }).then((response) => {
      const request = response.body.find(
        (entry: { requester: { id: string } }) => entry.requester.id === primaryAuth.user.id,
      )
      if (!request) throw new Error('Friendship request was not returned by the API')
      cy.request({
        method: 'POST',
        url: `${apiUrl}/friendships/accept`,
        headers: authHeaders(friendAuth.token),
        body: { friendshipId: request.id },
      })
    })
    cy.request({
      url: `${apiUrl}/gamification/leaderboard/friends`,
      headers: authHeaders(primaryAuth.token),
    })
      .its('body')
      .should('have.length.greaterThan', 0)
  })

  it('sends a password reset email through Mailpit and accepts the new password', () => {
    cy.visit('/forgot-password')
    cy.get('[data-cy="recovery-email"]').type(primary.email)
    cy.get('[data-cy="recovery-submit"]').click()
    cy.contains('Revisa tu correo').should('be.visible')

    waitForResetEmail(primary.email).then((resetUrl) => {
      cy.visit(resetUrl)
      cy.get('[data-cy="reset-password"]').type(resetPassword)
      cy.get('[data-cy="reset-password-confirmation"]').type(resetPassword)
      cy.get('[data-cy="reset-submit"]').click()
      cy.location('pathname').should('eq', '/login')
      login(primary.email, resetPassword).its('body.token').should('be.a', 'string')
    })
  })
})
