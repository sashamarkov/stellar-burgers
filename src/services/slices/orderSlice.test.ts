import orderReducer, {
  postOrder,
  clearOrder,
  initialState
} from './orderSlice';
import mockOrders from '../../../__mocks__/orders.json';

jest.mock('@api', () => ({
  orderBurgerApi: jest.fn()
}));

import { orderBurgerApi } from '@api';

describe('orderSlice', () => {
  const MOCK_ORDER = mockOrders[0];
  const MOCK_ORDERS = mockOrders;
  const INGREDIENTS_IDS = ['bun1', 'main1', 'sauce1', 'bun1'];

  let state: ReturnType<typeof orderReducer>;

  beforeEach(() => {
    jest.clearAllMocks();
    state = orderReducer(initialState, { type: 'reset' });
  });

  describe('оформление заказа', () => {
    it('должен установить orderRequest=true при начале оформления', () => {
      const action = { type: postOrder.pending.type };
      const newState = orderReducer(state, action);

      expect(newState.orderRequest).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен сохранить заказ и установить orderRequest=false при успешном оформлении', () => {
      const action = {
        type: postOrder.fulfilled.type,
        payload: MOCK_ORDER
      };
      const newState = orderReducer(state, action);

      expect(newState.orderRequest).toBe(false);
      expect(newState.orderModalData).toEqual(MOCK_ORDER);
      expect(newState.error).toBe(null);
    });

    it('должен установить ошибку и orderRequest=false при неудачном оформлении', () => {
      const errorMessage = 'Ошибка оформления заказа';
      const action = {
        type: postOrder.rejected.type,
        error: { message: errorMessage }
      };
      const newState = orderReducer(state, action);

      expect(newState.orderRequest).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.orderModalData).toBe(null);
    });

    it('должен использовать стандартное сообщение, если ошибка не содержит текста', () => {
      const action = {
        type: postOrder.rejected.type,
        error: {}
      };
      const newState = orderReducer(state, action);

      expect(newState.error).toBe('Ошибка оформления заказа');
    });

    it('должен сохранять данные заказа при повторном оформлении', () => {
      const fulfilledAction = {
        type: postOrder.fulfilled.type,
        payload: MOCK_ORDER
      };
      const stateWithOrder = orderReducer(state, fulfilledAction);

      const pendingAction = { type: postOrder.pending.type };
      const newState = orderReducer(stateWithOrder, pendingAction);

      expect(newState.orderRequest).toBe(true);
      expect(newState.orderModalData).toEqual(MOCK_ORDER);
    });

    it('должен заменить старый заказ новым при успешном оформлении', () => {
      const firstAction = {
        type: postOrder.fulfilled.type,
        payload: MOCK_ORDERS[0]
      };
      const stateWithFirstOrder = orderReducer(state, firstAction);

      const secondAction = {
        type: postOrder.fulfilled.type,
        payload: MOCK_ORDERS[1]
      };
      const finalState = orderReducer(stateWithFirstOrder, secondAction);

      expect(finalState.orderModalData).toEqual(MOCK_ORDERS[1]);
      expect(finalState.orderModalData?._id).toBe(MOCK_ORDERS[1]._id);
    });

    it('должен сбрасывать ошибку при новом успешном оформлении', () => {
      const errorAction = {
        type: postOrder.rejected.type,
        error: { message: 'Ошибка' }
      };
      const stateWithError = orderReducer(state, errorAction);
      expect(stateWithError.error).toBe('Ошибка');

      const successAction = {
        type: postOrder.fulfilled.type,
        payload: MOCK_ORDER
      };
      const newState = orderReducer(stateWithError, successAction);

      expect(newState.error).toBe(null);
      expect(newState.orderModalData).toEqual(MOCK_ORDER);
    });
  });

  describe('очистка заказа', () => {
    it('должен очистить данные заказа и ошибку', () => {
      const fulfilledAction = {
        type: postOrder.fulfilled.type,
        payload: MOCK_ORDER
      };
      const stateWithOrder = orderReducer(state, fulfilledAction);

      const clearAction = { type: clearOrder.type };
      const newState = orderReducer(stateWithOrder, clearAction);

      expect(newState.orderModalData).toBe(null);
      expect(newState.error).toBe(null);
      expect(newState.orderRequest).toBe(false);
    });

    it('должен корректно очищать пустое состояние', () => {
      const clearAction = { type: clearOrder.type };
      const newState = orderReducer(state, clearAction);

      expect(newState).toEqual(initialState);
    });
  });

  describe('граничные случаи', () => {
    it('должен корректно обрабатывать несколько последовательных оформлений', () => {
      let currentState = orderReducer(state, { type: postOrder.pending.type });
      expect(currentState.orderRequest).toBe(true);

      currentState = orderReducer(currentState, {
        type: postOrder.pending.type
      });
      expect(currentState.orderRequest).toBe(true);

      const errorAction = {
        type: postOrder.rejected.type,
        error: { message: 'Ошибка 1' }
      };
      currentState = orderReducer(currentState, errorAction);
      expect(currentState.orderRequest).toBe(false);
      expect(currentState.error).toBe('Ошибка 1');

      currentState = orderReducer(currentState, {
        type: postOrder.pending.type
      });
      expect(currentState.orderRequest).toBe(true);
      expect(currentState.error).toBe(null);
    });

    it('должен обрабатывать оформление заказа без ингредиентов', async () => {
      (orderBurgerApi as jest.Mock).mockRejectedValue(
        new Error('Нет ингредиентов')
      );

      const thunk = postOrder([]);
      const result = await thunk(
        jest.fn(),
        () => ({ order: initialState }),
        undefined
      );

      expect(postOrder.rejected.match(result)).toBe(true);
      if (postOrder.rejected.match(result)) {
        expect(result.error?.message).toBe('Нет ингредиентов');
      }
    });
  });

  describe('вызов API', () => {
    it('должен вызывать API с правильными ID ингредиентов', async () => {
      (orderBurgerApi as jest.Mock).mockResolvedValue({ order: MOCK_ORDER });

      const thunk = postOrder(INGREDIENTS_IDS);
      await thunk(jest.fn(), () => ({ order: initialState }), undefined);

      expect(orderBurgerApi).toHaveBeenCalledWith(INGREDIENTS_IDS);
      expect(orderBurgerApi).toHaveBeenCalledTimes(1);
    });

    it('должен корректно обрабатывать успешный ответ API', async () => {
      (orderBurgerApi as jest.Mock).mockResolvedValue({ order: MOCK_ORDER });

      const thunk = postOrder(INGREDIENTS_IDS);
      const result = await thunk(
        jest.fn(),
        () => ({ order: initialState }),
        undefined
      );

      expect(postOrder.fulfilled.match(result)).toBe(true);
      if (postOrder.fulfilled.match(result)) {
        expect(result.payload).toEqual(MOCK_ORDER);
      }
    });

    it('должен корректно обрабатывать ошибку API', async () => {
      const apiError = new Error('Ошибка сервера');
      (orderBurgerApi as jest.Mock).mockRejectedValue(apiError);

      const thunk = postOrder(INGREDIENTS_IDS);
      const result = await thunk(
        jest.fn(),
        () => ({ order: initialState }),
        undefined
      );

      expect(postOrder.rejected.match(result)).toBe(true);
      if (postOrder.rejected.match(result)) {
        expect(result.error?.message).toBe('Ошибка сервера');
      }
    });
  });
});
