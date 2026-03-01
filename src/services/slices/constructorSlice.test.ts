import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  initialState,
  clearConstructor
} from './constructorSlice';
import mockIngredients from '../../../__mocks__/ingredients.json';
import { TIngredient, TConstructorIngredient } from '@utils-types';

const expectIngredientWithId = (
  ingredient: TConstructorIngredient | null | undefined,
  expectedData: TIngredient
) => {
  expect(ingredient).toBeDefined();
  expect(ingredient).toMatchObject({
    _id: expectedData._id,
    name: expectedData.name,
    type: expectedData.type,
    price: expectedData.price,
    calories: expectedData.calories,
    carbohydrates: expectedData.carbohydrates,
    fat: expectedData.fat,
    image: expectedData.image,
    image_large: expectedData.image_large,
    image_mobile: expectedData.image_mobile
  });
  expectValidId(ingredient?.id);
};

const expectValidId = (id: string | undefined) => {
  expect(id).toBeDefined();
  expect(id).toMatch(/^[A-Za-z0-9_-]{21}$/);
  return id;
};

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

      expectIngredientWithId(newState.bun, TEST_INGREDIENTS.BUN);
      expect(newState.ingredients).toEqual([]);
    });

    it('должен добавить основную начинку в список ингредиентов', () => {
      const action = addIngredient(TEST_INGREDIENTS.MAIN);
      const newState = constructorReducer(state, action);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toHaveLength(1);
      expectIngredientWithId(newState.ingredients[0], TEST_INGREDIENTS.MAIN);
    });

    it('должен добавить соус в список ингредиентов', () => {
      const action = addIngredient(TEST_INGREDIENTS.SAUCE);
      const newState = constructorReducer(state, action);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toHaveLength(1);
      expectIngredientWithId(newState.ingredients[0], TEST_INGREDIENTS.SAUCE);
    });

    it('должен заменить существующую булку на новую при добавлении', () => {
      const firstBunAction = addIngredient(TEST_INGREDIENTS.BUN);
      const stateWithFirstBun = constructorReducer(state, firstBunAction);
      const firstBunId = stateWithFirstBun.bun?.id;

      const secondBunAction = addIngredient(TEST_INGREDIENTS.ANOTHER_BUN);
      const newState = constructorReducer(stateWithFirstBun, secondBunAction);

      expectIngredientWithId(newState.bun, TEST_INGREDIENTS.ANOTHER_BUN);
      expect(newState.bun?.id).not.toBe(firstBunId);
    });

    it('должен добавить уникальный id каждому ингредиенту', () => {
      const action1 = addIngredient(TEST_INGREDIENTS.MAIN);
      const action2 = addIngredient(TEST_INGREDIENTS.MAIN);
      const state1 = constructorReducer(state, action1);
      const state2 = constructorReducer(state1, action2);

      expect(state1.ingredients).toHaveLength(1);
      expect(state2.ingredients).toHaveLength(2);

      expectValidId(state1.ingredients[0].id);
      expectValidId(state2.ingredients[1].id);
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
      currentState.ingredients.forEach((ingredient) => {
        expectValidId(ingredient.id);
      });
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

    it('не должен ничего делать при удалении из пустого конструктора', () => {
      const removeAction = removeIngredient('some-id');
      const newState = constructorReducer(initialState, removeAction);

      expect(newState.ingredients).toEqual([]);
      expect(newState.bun).toBeNull();
    });

    it('не должен ничего делать при удалении с пустым id', () => {
      const removeAction = removeIngredient('');
      const newState = constructorReducer(state, removeAction);

      expect(newState.ingredients).toHaveLength(2);
      expect(newState.ingredients).toEqual(state.ingredients);
    });

    it('не должен ничего делать при удалении после очистки конструктора', () => {
      const clearAction = { type: clearConstructor.type };
      const clearedState = constructorReducer(state, clearAction);

      const removeAction = removeIngredient('some-id');
      const newState = constructorReducer(clearedState, removeAction);

      expect(newState.ingredients).toEqual([]);
      expect(newState.bun).toBeNull();
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

    it('не должен ничего менять при перемещении с отрицательным индексом вверх', () => {
      const moveUpAction = moveIngredientUp(-1);
      const newState = constructorReducer(state, moveUpAction);

      expect(newState.ingredients).toEqual(state.ingredients);
    });

    it('не должен ничего менять при перемещении с отрицательным индексом вниз', () => {
      const moveDownAction = moveIngredientDown(-5);
      const newState = constructorReducer(state, moveDownAction);

      expect(newState.ingredients).toEqual(state.ingredients);
    });

    it('не должен ничего менять при перемещении с индексом больше длины массива вверх', () => {
      const moveUpAction = moveIngredientUp(10);
      const newState = constructorReducer(state, moveUpAction);

      expect(newState.ingredients).toEqual(state.ingredients);
    });

    it('не должен ничего менять при перемещении с индексом больше длины массива вниз', () => {
      const moveDownAction = moveIngredientDown(10);
      const newState = constructorReducer(state, moveDownAction);

      expect(newState.ingredients).toEqual(state.ingredients);
    });

    it('не должен ничего менять при перемещении в пустом конструкторе', () => {
      const moveUpAction = moveIngredientUp(0);
      const newState = constructorReducer(initialState, moveUpAction);

      expect(newState.ingredients).toEqual([]);
    });

    it('должен корректно перемещать после удаления ингредиента', () => {
      let currentState = constructorReducer(
        initialState,
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

      expect(currentState.ingredients[0].type).toBe('main');
      expect(currentState.ingredients[1].type).toBe('sauce');
      expect(currentState.ingredients[2].type).toBe('main');

      const middleId = currentState.ingredients[1].id;
      currentState = constructorReducer(
        currentState,
        removeIngredient(middleId)
      );

      expect(currentState.ingredients).toHaveLength(2);
      expect(currentState.ingredients[0].type).toBe('main');
      expect(currentState.ingredients[1].type).toBe('main');

      const main1Id = currentState.ingredients[0].id;
      const main2Id = currentState.ingredients[1].id;

      const moveUpAction = moveIngredientUp(1);
      const newState = constructorReducer(currentState, moveUpAction);

      expect(newState.ingredients[0].id).toBe(main2Id);
      expect(newState.ingredients[1].id).toBe(main1Id);
    });
  });

  describe('очистка конструктора', () => {
    beforeEach(() => {
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.BUN));
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.MAIN));
      state = constructorReducer(state, addIngredient(TEST_INGREDIENTS.SAUCE));
    });

    it('должен полностью очистить конструктор', () => {
      const clearAction = { type: clearConstructor.type };
      const newState = constructorReducer(state, clearAction);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toHaveLength(0);
    });

    it('должен корректно очищать уже пустой конструктор', () => {
      const clearAction = { type: clearConstructor.type };
      const newState = constructorReducer(initialState, clearAction);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toEqual([]);
    });

    it('должен корректно обрабатывать множественную очистку', () => {
      const clearAction = { type: clearConstructor.type };

      const firstClear = constructorReducer(state, clearAction);
      expect(firstClear.bun).toBeNull();
      expect(firstClear.ingredients).toHaveLength(0);

      const secondClear = constructorReducer(firstClear, clearAction);
      expect(secondClear.bun).toBeNull();
      expect(secondClear.ingredients).toHaveLength(0);
    });
  });
});
