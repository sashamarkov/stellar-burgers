/// <reference types="cypress" />

import ingredients from '../../__mocks__/ingredients.json';

const BUN = ingredients.find((item) => item.type === 'bun');
const MAIN = ingredients.find((item) => item.type === 'main');
const SAUCE = ingredients.find((item) => item.type === 'sauce');
const DELAY_MS = 500;
if (!BUN || !MAIN || !SAUCE) {
  throw new Error(
    "Не все типы ингредиентов найдены в JSON. Проверьте '../../__mocks__/ingredients.json'"
  );
}

describe('Конструктор бургера', () => {
  beforeEach(() => {
    cy.interceptIngredients();
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  afterEach(() => {
    cy.wait(DELAY_MS);
  });

  describe('Проверка всех ингредиентов', () => {
    it('Должен отображать все ингредиенты из JSON', () => {
      ingredients.forEach((ingredient) => {
        cy.get(`[data-test-id="ingredient-${ingredient._id}"]`).should('exist');
        cy.get(`[data-test-id="ingredient-${ingredient._id}"]`).contains(
          ingredient.name
        );
        cy.get(`[data-test-id="ingredient-${ingredient._id}"]`).contains(
          ingredient.price
        );
      });
    });
  });

  describe('Добавление, перемещение, удаление ингредиентов', () => {
    it('Должен добавлять булку в конструктор', () => {
      cy.addIngredient(BUN._id);
      cy.contains(`${BUN.name} (верх)`).should('exist');
      cy.contains(`${BUN.name} (низ)`).should('exist');
    });

    it('Должен добавлять начинку в конструктор', () => {
      cy.addIngredient(MAIN._id);
      cy.contains(MAIN.name).should('exist');
    });

    it('Должен добавлять соус в конструктор', () => {
      cy.addIngredient(SAUCE._id);
      cy.contains(SAUCE.name).should('exist');
    });

    it('Должен перемещать начинку вниз', () => {
      cy.addIngredient(MAIN._id);
      cy.addIngredient(SAUCE._id);
      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]')
        .first()
        .within(() => {
          cy.get('button.move_button').eq(1).click();
        });

      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]')
        .first()
        .should('contain', SAUCE.name);
      cy.get('[data-test-id^="constructor-item-"]')
        .last()
        .should('contain', MAIN.name);
    });

    it('Должен перемещать начинку вверх', () => {
      cy.addIngredient(MAIN._id);
      cy.addIngredient(SAUCE._id);
      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]')
        .eq(1)
        .within(() => {
          cy.get('button.move_button').first().click();
        });

      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]')
        .first()
        .should('contain', SAUCE.name);
      cy.get('[data-test-id^="constructor-item-"]')
        .last()
        .should('contain', MAIN.name);
    });

    it('Должен удалять начинку из конструктора', () => {
      cy.addIngredient(MAIN._id);
      cy.addIngredient(SAUCE._id);
      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]').should('have.length', 2);

      cy.get('[data-test-id^="constructor-item-"]')
        .first()
        .within(() => {
          cy.get('.constructor-element__action').click();
        });

      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]').should('have.length', 1);
      cy.get('[data-test-id^="constructor-item-"]')
        .first()
        .should('contain', SAUCE.name);
      cy.get('[data-test-id^="constructor-item-"]').should(
        'not.contain',
        MAIN.name
      );
    });

    it('Должен удалять соус из конструктора', () => {
      cy.addIngredient(MAIN._id);
      cy.addIngredient(SAUCE._id);
      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]')
        .eq(1)
        .within(() => {
          cy.get('.constructor-element__action').click();
        });

      cy.wait(500);

      cy.get('[data-test-id^="constructor-item-"]').should('have.length', 1);
      cy.get('[data-test-id^="constructor-item-"]')
        .first()
        .should('contain', MAIN.name);
      cy.get('[data-test-id^="constructor-item-"]').should(
        'not.contain',
        SAUCE.name
      );
    });
  });

  describe('Модальное окно ингредиента', () => {
    it('Должен открывать модальное окно при клике на ингредиент', () => {
      cy.clickIngredientLink(BUN._id);
      cy.url().should('include', `/ingredients/${BUN._id}`);
      cy.contains('Детали ингредиента').should('be.visible');
      cy.contains(BUN.name).should('be.visible');
    });

    it('Должен отображать правильные данные ингредиента в модалке', () => {
      cy.clickIngredientLink(BUN._id);
      cy.checkIngredientDetails(BUN);
    });

    it('Должен закрывать модальное окно по клику на крестик', () => {
      cy.clickIngredientLink(BUN._id);
      cy.contains('Детали ингредиента').should('be.visible');
      cy.closeModal();
      cy.contains('Детали ингредиента').should('not.exist');
    });

    it('Должен закрывать модальное окно по клику на оверлей', () => {
      cy.clickIngredientLink(BUN._id);
      cy.contains('Детали ингредиента').should('be.visible');
      cy.get('[data-test-id="modal-overlay"]').click({ force: true });
      cy.contains('Детали ингредиента').should('not.exist');
    });
  });
});
