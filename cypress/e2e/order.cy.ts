/// <reference types="cypress" />

import ingredients from '../../__mocks__/ingredients.json';

const bun = ingredients.find((item) => item.type === 'bun');
const main = ingredients.find((item) => item.type === 'main');
const sauce = ingredients.find((item) => item.type === 'sauce');

describe('Создание заказа', () => {
  beforeEach(() => {
    cy.interceptIngredients();
    cy.interceptUser();
    cy.interceptOrder();
    cy.setAuthTokens();

    cy.visit('/');
    cy.wait('@getIngredients');
    cy.wait('@getUser');
  });

  afterEach(() => {
    cy.clearAuthTokens();
  });

  it('Должен создавать заказ и очищать конструктор', () => {
    cy.addIngredient(bun?._id!);
    cy.addIngredient(main?._id!);
    cy.addIngredient(sauce?._id!);

    cy.contains('button', 'Оформить заказ').click();
    cy.contains('Оформляем заказ...').should('be.visible');
    cy.wait('@createOrder');
    cy.contains('Оформляем заказ...').should('not.exist');

    cy.contains('12345').should('be.visible');
    cy.get('[data-test-id="order-details-image"]').should('be.visible');
    cy.contains('идентификатор заказа').should('be.visible');

    cy.closeModal();
    cy.contains('12345').should('not.exist');

    cy.contains('Выберите булки').should('be.visible');
    cy.contains('Выберите начинку').should('be.visible');
  });
});
