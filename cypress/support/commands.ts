import ingredients from '../../__mocks__/ingredients.json';
import orderCreate from '../../__mocks__/order-create.json';
import user from '../../__mocks__/user.json';
import { TIngredient } from '@utils-types';

// #region Перехват
Cypress.Commands.add('interceptIngredients', () => {
  cy.intercept('GET', 'https://norma.education-services.ru/api/ingredients', {
    statusCode: 200,
    body: { success: true, data: ingredients as TIngredient[] }
  }).as('getIngredients');
});

Cypress.Commands.add('interceptUser', () => {
  cy.intercept('GET', 'https://norma.education-services.ru/api/auth/user', {
    statusCode: 200,
    body: {
      success: true,
      user: user
    }
  }).as('getUser');
});

Cypress.Commands.add('interceptOrder', () => {
  cy.intercept(
    'POST',
    'https://norma.education-services.ru/api/orders',
    (req) => {
      req.on('response', (res) => {
        res.setDelay(1000);
      });
      req.reply({
        statusCode: 200,
        body: orderCreate
      });
    }
  ).as('createOrder');
});
// #endregion Перехват

// #region Работа с токенами
Cypress.Commands.add('setAuthTokens', () => {
  cy.setCookie('accessToken', 'Bearer test-access-token');
  localStorage.setItem('refreshToken', 'test-refresh-token');
});

Cypress.Commands.add('clearAuthTokens', () => {
  cy.clearCookie('accessToken');
  localStorage.removeItem('refreshToken');
});
// #endregion

// #region Работа с ингредиентами
Cypress.Commands.add('addIngredient', (ingredientId: string) => {
  cy.get(`[data-test-id="ingredient-${ingredientId}"] button`).click();
});

Cypress.Commands.add('clickIngredientLink', (ingredientId: string) => {
  cy.get(`[data-test-id="ingredient-${ingredientId}"] a`).click();
});

Cypress.Commands.add('removeIngredient', (ingredientName: string) => {
  cy.contains(ingredientName)
    .parents('[class*="constructor-element"]')
    .find('[class*="constructor-element__action"]')
    .click();
});

Cypress.Commands.add('moveIngredientUp', (ingredientName: string) => {
  cy.contains(ingredientName)
    .parents('[class*="constructor-element"]')
    .find('[class*="move-button_up"]')
    .click();
});

Cypress.Commands.add('moveIngredientDown', (ingredientName: string) => {
  cy.contains(ingredientName)
    .parents('[class*="constructor-element"]')
    .find('[class*="move-button_down"]')
    .click();
});

Cypress.Commands.add('checkIngredientDetails', (ingredient: TIngredient) => {
  cy.contains('Детали ингредиента').should('be.visible');
  cy.contains('Калории, ккал').parent().contains(ingredient.calories);
  cy.contains('Белки, г').parent().contains(ingredient.proteins);
  cy.contains('Жиры, г').parent().contains(ingredient.fat);
  cy.contains('Углеводы, г').parent().contains(ingredient.carbohydrates);
});
// #endregion

// #region Работа с модалкой
Cypress.Commands.add('closeModal', () => {
  cy.get('[data-test-id="modal-close"]').click();
});

Cypress.Commands.add('modalShouldBeClosed', () => {
  cy.get('[data-test-id="modal"]').should('not.exist');
});
// #endregion

declare global {
  namespace Cypress {
    interface Chainable {
      interceptIngredients(): Chainable<void>;
      interceptUser(): Chainable<void>;
      interceptOrder(): Chainable<void>;
      setAuthTokens(): Chainable<void>;
      clearAuthTokens(): Chainable<void>;
      addIngredient(ingredientId: string): Chainable<void>;
      removeIngredient(ingredientName: string): Chainable<void>;
      moveIngredientUp(ingredientName: string): Chainable<void>;
      moveIngredientDown(ingredientName: string): Chainable<void>;
      clickIngredientLink(ingredientId: string): Chainable<void>;
      closeModal(): Chainable<void>;
      modalShouldBeClosed(): Chainable<void>;
      checkIngredientDetails(ingredient: TIngredient): Chainable<void>;
    }
  }
}
