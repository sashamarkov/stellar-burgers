import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer, {
  initialState as initialIngredientsState
} from './slices/ingredientsSlice';
import constructorReducer, {
  initialState as initialConstructorState
} from './slices/constructorSlice';
import orderReducer, {
  initialState as initialOrderState
} from './slices/orderSlice';
import feedReducer, {
  initialState as initialFeedState
} from './slices/feedSlice';
import userReducer, {
  initialState as initialUserState
} from './slices/userSlice';
import orderByNumberReducer, {
  initialState as initialOrderByNumberState
} from './slices/orderByNumberSlice';
import ordersReducer, {
  initialState as initialOrdersState
} from './slices/ordersSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  order: orderReducer,
  feed: feedReducer,
  user: userReducer,
  orderByNumber: orderByNumberReducer,
  orders: ordersReducer
});

describe('rootReducer', () => {
  it('Должен возвращать начальный стейт для неизвестного дейтсвия', () => {
    const unknownAction = { type: 'UNKNOWN' };
    const state = rootReducer(undefined, unknownAction);

    const expectedState = {
      ingredients: initialIngredientsState,
      burgerConstructor: initialConstructorState,
      order: initialOrderState,
      feed: initialFeedState,
      user: initialUserState,
      orderByNumber: initialOrderByNumberState,
      orders: initialOrdersState
    };

    expect(state).toEqual(expectedState);
  });
});
