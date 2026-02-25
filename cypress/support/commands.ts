Cypress.Commands.add('setAuthTokens', () => {
  cy.setCookie('accessToken', 'Bearer test-access-token');
  localStorage.setItem('refreshToken', 'test-refresh-token');
});

Cypress.Commands.add('clearAuthTokens', () => {
  cy.clearCookie('accessToken');
  localStorage.removeItem('refreshToken');
});
declare namespace Cypress {
  interface Chainable {
    setAuthTokens(): Chainable<void>;
    clearAuthTokens(): Chainable<void>;
  }
}
