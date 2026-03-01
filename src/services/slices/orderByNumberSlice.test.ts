import orderByNumberReducer, {
  fetchOrderByNumber,
  initialState
} from './orderByNumberSlice';
import mockOrder from '../../../__mocks__/orders.json';
import { TOrder } from '@utils-types';

jest.mock('@api', () => ({
  getOrderByNumberApi: jest.fn()
}));

import { getOrderByNumberApi } from '@api';

const MOCK_ORDER = (mockOrder as TOrder[])[0];
const ORDER_NUMBER = MOCK_ORDER.number;

describe('orderByNumberSlice', () => {
  let state: ReturnType<typeof orderByNumberReducer>;

  beforeEach(() => {
    jest.clearAllMocks();
    state = orderByNumberReducer(initialState, { type: 'reset' });
  });

  describe('загрузка заказа по номеру', () => {
    it('должен установить loading=true при начале загрузки', () => {
      const action = { type: fetchOrderByNumber.pending.type };
      const newState = orderByNumberReducer(state, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен сохранить заказ и установить loading=false при успешной загрузке', () => {
      const action = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: MOCK_ORDER
      };
      const newState = orderByNumberReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.order).toEqual(MOCK_ORDER);
      expect(newState.error).toBe(null);
    });

    it('должен установить ошибку и loading=false при неудачной загрузке', () => {
      const errorMessage = 'Ошибка загрузки заказа';
      const action = {
        type: fetchOrderByNumber.rejected.type,
        error: { message: errorMessage }
      };
      const newState = orderByNumberReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.order).toBe(null);
    });

    it('должен использовать стандартное сообщение, если ошибка не содержит текста', () => {
      const action = {
        type: fetchOrderByNumber.rejected.type,
        error: {}
      };
      const newState = orderByNumberReducer(state, action);

      expect(newState.error).toBe('Ошибка загрузки заказа');
    });

    it('должен сохранять существующий заказ при повторной загрузке', () => {
      const fulfilledAction = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: MOCK_ORDER
      };
      const stateWithData = orderByNumberReducer(state, fulfilledAction);

      const pendingAction = { type: fetchOrderByNumber.pending.type };
      const newState = orderByNumberReducer(stateWithData, pendingAction);

      expect(newState.loading).toBe(true);
      expect(newState.order).toEqual(MOCK_ORDER);
    });

    it('должен заменить старый заказ новым при успешной загрузке', () => {
      const firstAction = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: { ...MOCK_ORDER, number: 11111 }
      };
      const stateWithFirstData = orderByNumberReducer(state, firstAction);
      expect(stateWithFirstData.order?.number).toBe(11111);

      const secondAction = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: MOCK_ORDER
      };
      const finalState = orderByNumberReducer(stateWithFirstData, secondAction);

      expect(finalState.order?.number).toBe(MOCK_ORDER.number);
      expect(finalState.order).toEqual(MOCK_ORDER);
    });

    it('должен сбрасывать ошибку при новой успешной загрузке', () => {
      const errorAction = {
        type: fetchOrderByNumber.rejected.type,
        error: { message: 'Ошибка' }
      };
      const stateWithError = orderByNumberReducer(state, errorAction);
      expect(stateWithError.error).toBe('Ошибка');

      const successAction = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: MOCK_ORDER
      };
      const newState = orderByNumberReducer(stateWithError, successAction);

      expect(newState.error).toBe(null);
      expect(newState.order).toEqual(MOCK_ORDER);
    });
  });

  describe('граничные случаи', () => {
    it('должен корректно обрабатывать заказ с минимальными данными', () => {
      const minimalOrder = {
        _id: 'minimal-id',
        number: 99999,
        status: 'done',
        name: 'Минимальный заказ',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ingredients: []
      };

      const action = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: minimalOrder
      };
      const newState = orderByNumberReducer(state, action);

      expect(newState.order).toEqual(minimalOrder);
      expect(newState.loading).toBe(false);
    });

    it('должен корректно обрабатывать несколько последовательных загрузок', () => {
      let currentState = orderByNumberReducer(state, {
        type: fetchOrderByNumber.pending.type
      });
      expect(currentState.loading).toBe(true);

      currentState = orderByNumberReducer(currentState, {
        type: fetchOrderByNumber.pending.type
      });
      expect(currentState.loading).toBe(true);

      const errorAction = {
        type: fetchOrderByNumber.rejected.type,
        error: { message: 'Ошибка 1' }
      };
      currentState = orderByNumberReducer(currentState, errorAction);
      expect(currentState.loading).toBe(false);
      expect(currentState.error).toBe('Ошибка 1');

      currentState = orderByNumberReducer(currentState, {
        type: fetchOrderByNumber.pending.type
      });
      expect(currentState.loading).toBe(true);
      expect(currentState.error).toBe(null);
    });

    it('должен обрабатывать несуществующий номер заказа', async () => {
      (getOrderByNumberApi as jest.Mock).mockRejectedValue(
        new Error('Заказ не найден')
      );

      const thunk = fetchOrderByNumber(999999);
      const result = await thunk(
        jest.fn(),
        () => ({ orderByNumber: initialState }),
        undefined
      );

      expect(fetchOrderByNumber.rejected.match(result)).toBe(true);
      if (fetchOrderByNumber.rejected.match(result)) {
        expect(result.error?.message).toBe('Заказ не найден');
      }
    });
  });

  describe('вызов API', () => {
    it('должен вызывать API с правильным номером заказа', async () => {
      (getOrderByNumberApi as jest.Mock).mockResolvedValue({
        orders: [MOCK_ORDER]
      });

      const thunk = fetchOrderByNumber(ORDER_NUMBER);
      await thunk(
        jest.fn(),
        () => ({ orderByNumber: initialState }),
        undefined
      );

      expect(getOrderByNumberApi).toHaveBeenCalledWith(ORDER_NUMBER);
      expect(getOrderByNumberApi).toHaveBeenCalledTimes(1);
    });

    it('должен корректно обрабатывать успешный ответ API', async () => {
      (getOrderByNumberApi as jest.Mock).mockResolvedValue({
        orders: [MOCK_ORDER]
      });

      const thunk = fetchOrderByNumber(ORDER_NUMBER);
      const result = await thunk(
        jest.fn(),
        () => ({ orderByNumber: initialState }),
        undefined
      );

      expect(fetchOrderByNumber.fulfilled.match(result)).toBe(true);
      if (fetchOrderByNumber.fulfilled.match(result)) {
        expect(result.payload).toEqual(MOCK_ORDER);
      }
    });

    it('должен корректно обрабатывать ошибку API', async () => {
      const apiError = new Error('Ошибка сервера');
      (getOrderByNumberApi as jest.Mock).mockRejectedValue(apiError);

      const thunk = fetchOrderByNumber(ORDER_NUMBER);
      const result = await thunk(
        jest.fn(),
        () => ({ orderByNumber: initialState }),
        undefined
      );

      expect(fetchOrderByNumber.rejected.match(result)).toBe(true);
      if (fetchOrderByNumber.rejected.match(result)) {
        expect(result.error?.message).toBe('Ошибка сервера');
      }
    });
  });
});
