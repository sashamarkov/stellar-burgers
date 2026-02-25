import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  initialState,
  clearConstructor
} from './constructorSlice';
import mockIngredients from '../../../__mocks__/ingredients.json';
import { TIngredient } from '@utils-types';

describe('constructorSlice', () => {
  const ingredients = mockIngredients as TIngredient[];
  const TEST_INGREDIENTS = {
    BUN: ingredients[0],
    MAIN: ingredients[2],
    SAUCE: ingredients[4],
    ANOTHER_BUN: ingredients[1]
  } as const;

  let state: typeof initialState;

  beforeEach(() => {
    state = constructorReducer(initialState, { type: 'reset' });
  });

  describe('добавление ингредиентов', () => {
    it('должен добавить булку и установить её как текущую', () => {
      const action = addIngredient(TEST_INGREDIENTS.BUN);
      const newState = constructorReducer(state, action);

      expect(newState.bun).toEqual({
        ...TEST_INGREDIENTS.BUN,
        id: expect.any(String)
      });
      expect(newState.ingredients).toEqual([]);
    });

    it('должен добавить основную начинку в список ингредиентов', () => {
      const action = addIngredient(TEST_INGREDIENTS.MAIN);
      const newState = constructorReducer(state, action);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toHaveLength(1);
      expect(newState.ingredients[0]).toEqual({
        ...TEST_INGREDIENTS.MAIN,
        id: expect.any(String)
      });
    });

    it('должен добавить соус в список ингредиентов', () => {
      const action = addIngredient(TEST_INGREDIENTS.SAUCE);
      const newState = constructorReducer(state, action);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toHaveLength(1);
      expect(newState.ingredients[0]).toEqual({
        ...TEST_INGREDIENTS.SAUCE,
        id: expect.any(String)
      });
    });

    it('должен заменить существующую булку на новую при добавлении', () => {
      const firstBunAction = addIngredient(TEST_INGREDIENTS.BUN);
      const stateWithFirstBun = constructorReducer(state, firstBunAction);

      const secondBunAction = addIngredient(TEST_INGREDIENTS.ANOTHER_BUN);
      const newState = constructorReducer(stateWithFirstBun, secondBunAction);

      expect(newState.bun).toEqual({
        ...TEST_INGREDIENTS.ANOTHER_BUN,
        id: expect.any(String)
      });
      expect(newState.bun?._id).toBe(TEST_INGREDIENTS.ANOTHER_BUN._id);
      expect(newState.bun?._id).not.toBe(TEST_INGREDIENTS.BUN._id);
    });

    it('должен добавить уникальный id каждому ингредиенту', () => {
      const action1 = addIngredient(TEST_INGREDIENTS.MAIN);
      const action2 = addIngredient(TEST_INGREDIENTS.MAIN);
      const state1 = constructorReducer(state, action1);
      const state2 = constructorReducer(state1, action2);

      expect(state1.ingredients[0].id).not.toBe(state2.ingredients[1].id);
    });

    it('должен корректно обрабатывать добавление нескольких ингредиентов', () => {
      let currentState = constructorReducer(
        state,
        addIngredient(TEST_INGREDIENTS.MAIN)
      );
      currentState = constructorReducer(
        currentState,
        addIngredient(TEST_INGREDIENTS.SAUCE)
      );
      currentState = constructorReducer(
        currentState,
        addIngredient(TEST_INGREDIENTS.MAIN)
      );

      expect(currentState.ingredients).toHaveLength(3);
    });

    it('должен добавлять ингредиенты в пустой конструктор', () => {
      const newState = constructorReducer(
        state,
        addIngredient(TEST_INGREDIENTS.SAUCE)
      );

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toHaveLength(1);
      expect(newState.ingredients[0].type).toBe('sauce');
    });
  });

  describe('удаление ингредиентов', () => {
    beforeEach(() => {
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.MAIN));
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.SAUCE));
    });

    it('должен удалить ингредиент по его id', () => {
      const ingredientId = state.ingredients[0].id;
      const removeAction = removeIngredient(ingredientId);
      const newState = constructorReducer(state, removeAction);

      expect(newState.ingredients).toHaveLength(1);
      expect(newState.ingredients[0].id).toBe(state.ingredients[1].id);
    });

    it('не должен ничего делать при удалении несуществующего ингредиента', () => {
      const originalState = { ...state };
      const removeAction = removeIngredient('несуществующий-id');
      const newState = constructorReducer(state, removeAction);

      expect(newState.ingredients).toHaveLength(2);
      expect(newState.ingredients).toEqual(originalState.ingredients);
    });
  });

  describe('перемещение ингредиентов', () => {
    beforeEach(() => {
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.MAIN));
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.SAUCE));
    });

    it('должен переместить ингредиент вверх и сохранить порядок остальных', () => {
      expect(state.ingredients[0].type).toBe('main');
      expect(state.ingredients[1].type).toBe('sauce');

      const moveUpAction = moveIngredientUp(1);
      const newState = constructorReducer(state, moveUpAction);

      expect(newState.ingredients[0].type).toBe('sauce');
      expect(newState.ingredients[1].type).toBe('main');
    });

    it('должен переместить ингредиент вниз и сохранить порядок остальных', () => {
      expect(state.ingredients[0].type).toBe('main');
      expect(state.ingredients[1].type).toBe('sauce');

      const moveDownAction = moveIngredientDown(0);
      const newState = constructorReducer(state, moveDownAction);

      expect(newState.ingredients[0].type).toBe('sauce');
      expect(newState.ingredients[1].type).toBe('main');
    });

    it('не должен перемещать ингредиент вверх, если он первый', () => {
      const moveUpAction = moveIngredientUp(0);
      const newState = constructorReducer(state, moveUpAction);

      expect(newState.ingredients).toEqual(state.ingredients);
    });

    it('не должен перемещать ингредиент вниз, если он последний', () => {
      const moveDownAction = moveIngredientDown(1);
      const newState = constructorReducer(state, moveDownAction);

      expect(newState.ingredients).toEqual(state.ingredients);
    });

    it('не должен ничего менять при перемещении единственного ингредиента вверх', () => {
      const singleIngredientState = constructorReducer(
        initialState,
        addIngredient(TEST_INGREDIENTS.MAIN)
      );

      const moveUpAction = moveIngredientUp(0);
      const newState = constructorReducer(singleIngredientState, moveUpAction);

      expect(newState.ingredients).toHaveLength(1);
      expect(newState.ingredients).toEqual(singleIngredientState.ingredients);
    });

    it('не должен ничего менять при перемещении единственного ингредиента вниз', () => {
      const singleIngredientState = constructorReducer(
        initialState,
        addIngredient(TEST_INGREDIENTS.MAIN)
      );

      const moveDownAction = moveIngredientDown(0);
      const newState = constructorReducer(
        singleIngredientState,
        moveDownAction
      );

      expect(newState.ingredients).toHaveLength(1);
      expect(newState.ingredients).toEqual(singleIngredientState.ingredients);
    });
  });

  describe('очистка конструктора', () => {
    beforeEach(() => {
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.BUN));
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.MAIN));
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.SAUCE));
    });

    it('должен полностью очистить конструктор (булку и все ингредиенты)', () => {
      const clearAction = { type: clearConstructor.type };
      const newState = constructorReducer(state, clearAction);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toHaveLength(0);
    });
  });
});
