import ingredientsReducer, { fetchIngredients, initialState } from './ingredientsSlice';
import mockIngredients from '../../../__mocks__/ingredients.json';
import { TIngredient } from '@utils-types';
import { RootState } from '../store';

// Мокаем модуль API
jest.mock('@api', () => ({
  getIngredientsApi: jest.fn(),
}));

import { getIngredientsApi } from '@api';

describe('ingredientsSlice', () => {
  const ingredients = mockIngredients as TIngredient[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Существующие тесты
  it('should handle fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle fetchIngredients.fulfilled', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients,
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.ingredients).toEqual(ingredients);
    expect(state.error).toBe(null);
  });

  it('should handle fetchIngredients.rejected', () => {
    const errorMessage = 'Ошибка загрузки';
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: errorMessage },
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
    expect(state.ingredients).toEqual([]);
  });

  // Граничные случаи
  it('should preserve existing ingredients when pending starts', () => {
    const fulfilledAction = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients,
    };
    const stateWithData = ingredientsReducer(initialState, fulfilledAction);
    
    const pendingAction = { type: fetchIngredients.pending.type };
    const newState = ingredientsReducer(stateWithData, pendingAction);

    expect(newState.loading).toBe(true);
    expect(newState.ingredients).toEqual(ingredients);
  });

  it('should handle empty ingredients array', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: [],
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.ingredients).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('should handle error with no message', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: {},
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.error).toBe('Ошибка загрузки ингредиентов');
  });

  it('should replace old ingredients with new ones on fulfilled', () => {
    const firstAction = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients.slice(0, 2),
    };
    const stateWithFirstData = ingredientsReducer(initialState, firstAction);
    expect(stateWithFirstData.ingredients).toHaveLength(2);
    
    const secondAction = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients,
    };
    const finalState = ingredientsReducer(stateWithFirstData, secondAction);

    expect(finalState.ingredients).toHaveLength(ingredients.length);
    expect(finalState.ingredients).toEqual(ingredients);
  });

  it('should handle multiple pending/rejected without breaking', () => {
    let state = ingredientsReducer(initialState, { type: fetchIngredients.pending.type });
    expect(state.loading).toBe(true);

    state = ingredientsReducer(state, { type: fetchIngredients.pending.type });
    expect(state.loading).toBe(true);

    const errorAction = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Ошибка 1' },
    };
    state = ingredientsReducer(state, errorAction);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка 1');

    state = ingredientsReducer(state, { type: fetchIngredients.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  // Тест для condition
// Тест для condition
it('should not fetch ingredients if they already exist', async () => {
  // Создаем мок для getState, который возвращает стейт с уже загруженными ингредиентами
  const mockGetState = jest.fn(() => ({
    ingredients: {
      ...initialState,
      ingredients: ingredients,
    },
  })) as any;

  // Вызываем thunk с condition
  const thunk = fetchIngredients();
  const result = await thunk(
    jest.fn(),
    mockGetState,
    undefined
  ) as any;

  // Проверяем что condition сработал и запрос НЕ был сделан
  expect(result.meta?.condition).toBe(true);
  expect(result.payload).toBeUndefined();
  expect(getIngredientsApi).not.toHaveBeenCalled();
});

it('should fetch ingredients if they do not exist', async () => {
  // Мокаем успешный ответ API
  (getIngredientsApi as jest.Mock).mockResolvedValue(ingredients);

  // Создаем мок для getState, который возвращает пустой стейт
  const mockGetState = jest.fn(() => ({
    ingredients: initialState,
  })) as any;

  // Вызываем thunk
  const thunk = fetchIngredients();
  const result = await thunk(
    jest.fn(),
    mockGetState,
    undefined
  );

  // Проверяем что запрос был сделан и вернул данные
  expect(result.type).toBe(fetchIngredients.fulfilled.type);
  expect(result.payload).toEqual(ingredients);
  expect(getIngredientsApi).toHaveBeenCalledTimes(1);
});

  it('should fetch ingredients if they do not exist', async () => {
    // Мокаем успешный ответ API
    (getIngredientsApi as jest.Mock).mockResolvedValue(ingredients);

    // Создаем мок для getState, который возвращает пустой стейт
    const mockGetState = jest.fn(() => ({
      ingredients: initialState,
    })) as any;

    // Вызываем thunk
    const thunk = fetchIngredients();
    const result = await thunk(
      jest.fn(),
      mockGetState,
      undefined
    );

    // Проверяем что запрос был сделан и вернул данные
    expect(result.type).toBe(fetchIngredients.fulfilled.type);
    expect(result.payload).toEqual(ingredients);
    expect(getIngredientsApi).toHaveBeenCalledTimes(1);
  });
});