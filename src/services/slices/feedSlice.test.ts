import feedReducer, { fetchFeeds, initialState } from './feedSlice';
import mockFeed from '../../../__mocks__/feed.json';

describe('feedSlice', () => {
  let state: ReturnType<typeof feedReducer>;

  beforeEach(() => {
    state = feedReducer(initialState, { type: 'reset' });
  });

  describe('загрузка ленты заказов', () => {
    const MOCK_FEED = mockFeed;
    const EMPTY_FEED = {
      orders: [],
      total: 0,
      totalToday: 0
    };

    it('должен установить loading=true при начале загрузки', () => {
      const action = { type: fetchFeeds.pending.type };
      const newState = feedReducer(state, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен сохранить данные и установить loading=false при успешной загрузке', () => {
      const action = {
        type: fetchFeeds.fulfilled.type,
        payload: MOCK_FEED
      };
      const newState = feedReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.orders).toEqual(MOCK_FEED.orders);
      expect(newState.total).toBe(MOCK_FEED.total);
      expect(newState.totalToday).toBe(MOCK_FEED.totalToday);
      expect(newState.error).toBe(null);
    });

    it('должен установить ошибку и loading=false при неудачной загрузке', () => {
      const errorMessage = 'Ошибка загрузки ленты';
      const action = {
        type: fetchFeeds.rejected.type,
        error: { message: errorMessage }
      };
      const newState = feedReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.orders).toEqual([]);
      expect(newState.total).toBe(0);
      expect(newState.totalToday).toBe(0);
    });

    it('должен использовать стандартное сообщение, если ошибка не содержит текста', () => {
      const action = {
        type: fetchFeeds.rejected.type,
        error: {}
      };
      const newState = feedReducer(state, action);

      expect(newState.error).toBe('Ошибка загрузки ленты заказов');
    });

    it('должен сохранять существующие заказы при повторной загрузке', () => {
      const fulfilledAction = {
        type: fetchFeeds.fulfilled.type,
        payload: MOCK_FEED
      };
      const stateWithData = feedReducer(state, fulfilledAction);

      const pendingAction = { type: fetchFeeds.pending.type };
      const newState = feedReducer(stateWithData, pendingAction);

      expect(newState.loading).toBe(true);
      expect(newState.orders).toEqual(MOCK_FEED.orders);
      expect(newState.total).toBe(MOCK_FEED.total);
      expect(newState.totalToday).toBe(MOCK_FEED.totalToday);
    });

    it('должен заменить старые заказы новыми при успешной загрузке', () => {
      const firstAction = {
        type: fetchFeeds.fulfilled.type,
        payload: MOCK_FEED
      };
      const stateWithFirstData = feedReducer(state, firstAction);

      const newFeed = {
        orders: [
          {
            _id: 'newOrder',
            number: 99999,
            status: 'done',
            name: 'Новый заказ',
            createdAt: '2026-02-02T00:00:00.000Z',
            updatedAt: '2026-02-02T00:00:00.000Z',
            ingredients: ['bun1', 'main1']
          }
        ],
        total: 200,
        totalToday: 10
      };

      const secondAction = {
        type: fetchFeeds.fulfilled.type,
        payload: newFeed
      };
      const finalState = feedReducer(stateWithFirstData, secondAction);

      expect(finalState.orders).toEqual(newFeed.orders);
      expect(finalState.total).toBe(200);
      expect(finalState.totalToday).toBe(10);
    });
  });

  describe('граничные случаи', () => {
    const MOCK_FEED = mockFeed;

    it('должен корректно обрабатывать пустой список заказов', () => {
      const emptyFeed = {
        orders: [],
        total: 0,
        totalToday: 0
      };

      const action = {
        type: fetchFeeds.fulfilled.type,
        payload: emptyFeed
      };
      const newState = feedReducer(state, action);

      expect(newState.orders).toEqual([]);
      expect(newState.total).toBe(0);
      expect(newState.totalToday).toBe(0);
    });

    it('должен корректно обрабатывать несколько последовательных загрузок', () => {
      let currentState = feedReducer(state, { type: fetchFeeds.pending.type });
      expect(currentState.loading).toBe(true);

      currentState = feedReducer(currentState, {
        type: fetchFeeds.pending.type
      });
      expect(currentState.loading).toBe(true);

      const errorAction = {
        type: fetchFeeds.rejected.type,
        error: { message: 'Ошибка 1' }
      };
      currentState = feedReducer(currentState, errorAction);
      expect(currentState.loading).toBe(false);
      expect(currentState.error).toBe('Ошибка 1');

      currentState = feedReducer(currentState, {
        type: fetchFeeds.pending.type
      });
      expect(currentState.loading).toBe(true);
      expect(currentState.error).toBe(null);
    });

    it('должен сбрасывать ошибку при новой успешной загрузке', () => {
      const errorAction = {
        type: fetchFeeds.rejected.type,
        error: { message: 'Ошибка' }
      };
      const stateWithError = feedReducer(state, errorAction);
      expect(stateWithError.error).toBe('Ошибка');

      const successAction = {
        type: fetchFeeds.fulfilled.type,
        payload: MOCK_FEED
      };
      const newState = feedReducer(stateWithError, successAction);

      expect(newState.error).toBe(null);
      expect(newState.orders).toEqual(MOCK_FEED.orders);
    });
  });
});
