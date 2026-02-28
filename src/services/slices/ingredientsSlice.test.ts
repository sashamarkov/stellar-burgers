import ingredientsReducer, {
  fetchIngredients,
  initialState
} from './ingredientsSlice';
import mockIngredients from '../../../__mocks__/ingredients.json';
import { TIngredient } from '@utils-types';
import { RootState } from '../store';
import { AsyncThunkAction } from '@reduxjs/toolkit';

jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

import { getIngredientsApi } from '@api';

type FulfilledAction = {
  type: string;
  payload: TIngredient[];
  meta: {
    requestId: string;
    requestStatus: 'fulfilled';
    condition: boolean;
  };
};

type RejectedAction = {
  type: string;
  error: { message?: string };
  meta: {
    requestId: string;
    requestStatus: 'rejected';
    condition: boolean;
  };
};

type PendingAction = {
  type: string;
  meta: {
    requestId: string;
    requestStatus: 'pending';
    condition: boolean;
  };
};

type ThunkResult = FulfilledAction | RejectedAction | PendingAction;

describe('ingredientsSlice', () => {
  const ingredients = mockIngredients as TIngredient[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен обрабатывать fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('должен обрабатывать fetchIngredients.fulfilled', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.ingredients).toEqual(ingredients);
    expect(state.error).toBe(null);
  });

  it('должен обрабатывать fetchIngredients.rejected', () => {
    const errorMessage = 'Ошибка загрузки';
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: errorMessage }
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
    expect(state.ingredients).toEqual([]);
  });

  it('должен сохранять существующие ингредиенты при повторной загрузке', () => {
    const fulfilledAction = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients
    };
    const stateWithData = ingredientsReducer(initialState, fulfilledAction);

    const pendingAction = { type: fetchIngredients.pending.type };
    const newState = ingredientsReducer(stateWithData, pendingAction);

    expect(newState.loading).toBe(true);
    expect(newState.ingredients).toEqual(ingredients);
  });

  it('должен обрабатывать пустой массив ингредиентов', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: []
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.ingredients).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('должен обрабатывать ошибку без сообщения', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: {}
    };
    const state = ingredientsReducer(initialState, action);

    expect(state.error).toBe('Ошибка загрузки ингредиентов');
  });

  it('должен заменять старые ингредиенты новыми при успешной загрузке', () => {
    const firstAction = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients.slice(0, 2)
    };
    const stateWithFirstData = ingredientsReducer(initialState, firstAction);
    expect(stateWithFirstData.ingredients).toHaveLength(2);

    const secondAction = {
      type: fetchIngredients.fulfilled.type,
      payload: ingredients
    };
    const finalState = ingredientsReducer(stateWithFirstData, secondAction);

    expect(finalState.ingredients).toHaveLength(ingredients.length);
    expect(finalState.ingredients).toEqual(ingredients);
  });

  it('должен корректно обрабатывать множественные загрузки/ошибки', () => {
    let state = ingredientsReducer(initialState, {
      type: fetchIngredients.pending.type
    });
    expect(state.loading).toBe(true);

    state = ingredientsReducer(state, { type: fetchIngredients.pending.type });
    expect(state.loading).toBe(true);

    const errorAction = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Ошибка 1' }
    };
    state = ingredientsReducer(state, errorAction);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка 1');

    state = ingredientsReducer(state, { type: fetchIngredients.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('не должен загружать ингредиенты, если они уже существуют', async () => {
    const mockGetState = jest.fn<RootState, []>(() => ({
      ingredients: {
        ...initialState,
        ingredients: ingredients
      },
      burgerConstructor: { bun: null, ingredients: [] },
      order: { orderRequest: false, orderModalData: null, error: null },
      feed: {
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: null
      },
      user: { user: null, isAuthChecked: false, loading: false, error: null },
      orderByNumber: { order: null, loading: false, error: null },
      orders: { orders: [], loading: false, error: null }
    }));

    const thunk = fetchIngredients();
    const result = (await thunk(
      jest.fn(),
      mockGetState,
      undefined
    )) as ThunkResult;

    if ('meta' in result) {
      expect(result.meta.condition).toBe(true);
    }
    if ('payload' in result) {
      expect(result.payload).toBeUndefined();
    } else {
      expect(result).toBeDefined();
    }
    expect(getIngredientsApi).not.toHaveBeenCalled();
  });

  it('должен загружать ингредиенты, если их нет', async () => {
    (getIngredientsApi as jest.Mock).mockResolvedValue(ingredients);

    const mockGetState = jest.fn<RootState, []>(() => ({
      ingredients: initialState,
      burgerConstructor: { bun: null, ingredients: [] },
      order: { orderRequest: false, orderModalData: null, error: null },
      feed: {
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: null
      },
      user: { user: null, isAuthChecked: false, loading: false, error: null },
      orderByNumber: { order: null, loading: false, error: null },
      orders: { orders: [], loading: false, error: null }
    }));

    const thunk = fetchIngredients();
    const result = (await thunk(
      jest.fn(),
      mockGetState,
      undefined
    )) as ThunkResult;

    if ('payload' in result && result.meta.requestStatus === 'fulfilled') {
      expect(result.type).toBe(fetchIngredients.fulfilled.type);
      expect(result.payload).toEqual(ingredients);
    }
    expect(getIngredientsApi).toHaveBeenCalledTimes(1);
  });
});
