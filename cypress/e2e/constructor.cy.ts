/// <reference types="cypress" />

import ingredients from '../../__mocks__/ingredients.json';

describe('Конструктор бургера', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://norma.education-services.ru/api/ingredients', {
      statusCode: 200,
      body: {
        success: true,
        data: ingredients
      }
    }).as('getIngredients');

    cy.visit('/');
    cy.wait('@getIngredients');
  });

  describe('Добавление ингредиентов', () => {
    it('Должен добавлять булку в конструктор', function () {
      cy.get('[data-test-id="ingredient-bun1"] button').click();
      cy.contains('Краторная булка N-200i (верх)').should('exist');
      cy.contains('Краторная булка N-200i (низ)').should('exist');
    });

    it('Должен добавлять начинку в конструктор', function () {
      cy.get('[data-test-id="ingredient-main1"] button').click();
      cy.contains('Мясо бессмертных моллюсков Protostomia').should('exist');
    });

    it('Должен добавлять соус в конструктор', function () {
      cy.get('[data-test-id="ingredient-sauce1"] button').click();
      cy.contains('Соус Spicy-X').should('exist');
    });
  });

  describe('Модальное окно ингредиента', () => {
    it('Должен открывать модальное окно при клике на ингредиент', function () {
      cy.get('[data-test-id="ingredient-bun1"] a').click();
      cy.url().should('include', '/ingredients/bun1');
      cy.contains('Детали ингредиента').should('be.visible');
      cy.contains('Краторная булка N-200i').should('be.visible');
    });

    it('Должен отображать правильные данные ингредиента в модалке', function () {
      cy.get('[data-test-id="ingredient-bun1"] a').click();
      cy.contains('Детали ингредиента').should('be.visible');
      cy.contains('Калории, ккал').parent().contains('420');
      cy.contains('Белки, г').parent().contains('80');
      cy.contains('Жиры, г').parent().contains('24');
      cy.contains('Углеводы, г').parent().contains('53');
    });

    it('Должен закрывать модальное окно по клику на крестик', function () {
      cy.get('[data-test-id="ingredient-bun1"] a').click();
      cy.contains('Детали ингредиента').should('be.visible');

      cy.get('[data-test-id="modal-close"]').click();
      cy.contains('Детали ингредиента').should('not.exist');
    });

    it('Должен закрывать модальное окно по клику на оверлей', function () {
      cy.get('[data-test-id="ingredient-bun1"] a').click();
      cy.contains('Детали ингредиента').should('be.visible');

      cy.get('[data-test-id="modal-overlay"]').click({ force: true });
      cy.contains('Детали ингредиента').should('not.exist');
    });
  });
});
