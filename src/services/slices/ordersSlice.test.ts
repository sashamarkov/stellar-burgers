import ordersReducer, {
  fetchUserOrders,
  clearOrders,
  initialState
} from './ordersSlice';
import mockOrders from '../../../__mocks__/orders.json';

jest.mock('@api', () => ({
  getOrdersApi: jest.fn()
}));

import { getOrdersApi } from '@api';

describe('ordersSlice', () => {
  const MOCK_ORDERS = mockOrders;
  const MOCK_SINGLE_ORDER = mockOrders.slice(0, 1);

  let state: ReturnType<typeof ordersReducer>;

  beforeEach(() => {
    jest.clearAllMocks();
    state = ordersReducer(initialState, { type: 'reset' });
  });

  describe('загрузка заказов пользователя', () => {
    it('должен установить loading=true при начале загрузки', () => {
      const action = { type: fetchUserOrders.pending.type };
      const newState = ordersReducer(state, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен сохранить заказы и установить loading=false при успешной загрузке', () => {
      const action = {
        type: fetchUserOrders.fulfilled.type,
        payload: MOCK_ORDERS
      };
      const newState = ordersReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.orders).toEqual(MOCK_ORDERS);
      expect(newState.error).toBe(null);
    });

    it('должен установить ошибку и loading=false при неудачной загрузке', () => {
      const errorMessage = 'Ошибка загрузки заказов';
      const action = {
        type: fetchUserOrders.rejected.type,
        error: { message: errorMessage }
      };
      const newState = ordersReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.orders).toEqual([]);
    });

    it('должен использовать стандартное сообщение, если ошибка не содержит текста', () => {
      const action = {
        type: fetchUserOrders.rejected.type,
        error: {}
      };
      const newState = ordersReducer(state, action);

      expect(newState.error).toBe('Ошибка загрузки заказов');
    });

    it('должен сохранять существующие заказы при повторной загрузке', () => {
      const fulfilledAction = {
        type: fetchUserOrders.fulfilled.type,
        payload: MOCK_ORDERS
      };
      const stateWithOrders = ordersReducer(state, fulfilledAction);

      const pendingAction = { type: fetchUserOrders.pending.type };
      const newState = ordersReducer(stateWithOrders, pendingAction);

      expect(newState.loading).toBe(true);
      expect(newState.orders).toEqual(MOCK_ORDERS);
    });

    it('должен заменить старые заказы новыми при успешной загрузке', () => {
      const firstAction = {
        type: fetchUserOrders.fulfilled.type,
        payload: MOCK_SINGLE_ORDER
      };
      const stateWithFirstOrders = ordersReducer(state, firstAction);
      expect(stateWithFirstOrders.orders).toHaveLength(1);

      const secondAction = {
        type: fetchUserOrders.fulfilled.type,
        payload: MOCK_ORDERS
      };
      const finalState = ordersReducer(stateWithFirstOrders, secondAction);

      expect(finalState.orders).toHaveLength(MOCK_ORDERS.length);
      expect(finalState.orders).toEqual(MOCK_ORDERS);
    });

    it('должен сбрасывать ошибку при новой успешной загрузке', () => {
      const errorAction = {
        type: fetchUserOrders.rejected.type,
        error: { message: 'Ошибка' }
      };
      const stateWithError = ordersReducer(state, errorAction);
      expect(stateWithError.error).toBe('Ошибка');

      const successAction = {
        type: fetchUserOrders.fulfilled.type,
        payload: MOCK_ORDERS
      };
      const newState = ordersReducer(stateWithError, successAction);

      expect(newState.error).toBe(null);
      expect(newState.orders).toEqual(MOCK_ORDERS);
    });
  });

  describe('очистка заказов', () => {
    it('должен очистить список заказов', () => {
      const fulfilledAction = {
        type: fetchUserOrders.fulfilled.type,
        payload: MOCK_ORDERS
      };
      const stateWithOrders = ordersReducer(state, fulfilledAction);

      const clearAction = { type: clearOrders.type };
      const newState = ordersReducer(stateWithOrders, clearAction);

      expect(newState.orders).toEqual([]);
      expect(newState.loading).toBe(false);
    });

    it('должен корректно очищать пустое состояние', () => {
      const clearAction = { type: clearOrders.type };
      const newState = ordersReducer(state, clearAction);

      expect(newState.orders).toEqual([]);
      expect(newState).toEqual(initialState);
    });
  });

  describe('граничные случаи', () => {
    it('должен корректно обрабатывать пустой массив заказов', () => {
      const action = {
        type: fetchUserOrders.fulfilled.type,
        payload: []
      };
      const newState = ordersReducer(state, action);

      expect(newState.orders).toEqual([]);
      expect(newState.loading).toBe(false);
    });

    it('должен корректно обрабатывать несколько последовательных загрузок', () => {
      let currentState = ordersReducer(state, {
        type: fetchUserOrders.pending.type
      });
      expect(currentState.loading).toBe(true);

      currentState = ordersReducer(currentState, {
        type: fetchUserOrders.pending.type
      });
      expect(currentState.loading).toBe(true);

      const errorAction = {
        type: fetchUserOrders.rejected.type,
        error: { message: 'Ошибка 1' }
      };
      currentState = ordersReducer(currentState, errorAction);
      expect(currentState.loading).toBe(false);
      expect(currentState.error).toBe('Ошибка 1');

      currentState = ordersReducer(currentState, {
        type: fetchUserOrders.pending.type
      });
      expect(currentState.loading).toBe(true);
      expect(currentState.error).toBe(null);
    });
  });

  describe('вызов API', () => {
    it('должен вызывать API для получения заказов', async () => {
      (getOrdersApi as jest.Mock).mockResolvedValue(MOCK_ORDERS);

      const thunk = fetchUserOrders();
      await thunk(jest.fn(), () => ({ orders: initialState }), undefined);

      expect(getOrdersApi).toHaveBeenCalledTimes(1);
    });

    it('должен корректно обрабатывать успешный ответ API', async () => {
      (getOrdersApi as jest.Mock).mockResolvedValue(MOCK_ORDERS);

      const thunk = fetchUserOrders();
      const result = await thunk(
        jest.fn(),
        () => ({ orders: initialState }),
        undefined
      );

      expect(fetchUserOrders.fulfilled.match(result)).toBe(true);
      if (fetchUserOrders.fulfilled.match(result)) {
        expect(result.payload).toEqual(MOCK_ORDERS);
      }
    });

    it('должен корректно обрабатывать ошибку API', async () => {
      const apiError = new Error('Ошибка сервера');
      (getOrdersApi as jest.Mock).mockRejectedValue(apiError);

      const thunk = fetchUserOrders();
      const result = await thunk(
        jest.fn(),
        () => ({ orders: initialState }),
        undefined
      );

      expect(fetchUserOrders.rejected.match(result)).toBe(true);
      if (fetchUserOrders.rejected.match(result)) {
        expect(result.error?.message).toBe('Ошибка сервера');
      }
    });
  });
});
