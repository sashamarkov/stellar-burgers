import userReducer, {
  login,
  register,
  logout,
  getUser,
  updateUser,
  forgotPassword,
  resetPassword,
  authChecked,
  clearError,
  initialState
} from './userSlice';
import * as apiResponses from '../../../__mocks__/apiResponses';
import { TUser } from '@utils-types';

jest.mock('@api', () => ({
  loginUserApi: jest.fn(),
  registerUserApi: jest.fn(),
  getUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  logoutApi: jest.fn(),
  forgotPasswordApi: jest.fn(),
  resetPasswordApi: jest.fn()
}));

import {
  loginUserApi,
  registerUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi
} from '@api';

describe('userSlice', () => {
  const MOCK_USER: TUser = apiResponses.loginSuccess.user;
  const UPDATED_USER = { ...MOCK_USER, name: 'Updated Name' };
  const LOGIN_DATA = {
    email: 'test@test.com',
    password: 'correct-password'
  };
  const REGISTER_DATA = {
    email: 'test@test.com',
    password: 'password123',
    name: 'Test User'
  };
  const UPDATE_DATA = { name: 'New Name' };
  const RESET_DATA = { password: 'newpass', token: 'token123' };
  const TEST_EMAIL = 'test@test.com';

  let state: ReturnType<typeof userReducer>;

  beforeEach(() => {
    jest.clearAllMocks();
    state = userReducer(initialState, { type: 'reset' });
  });

  describe('авторизация (login)', () => {
    it('должен установить loading=true при начале входа', () => {
      const action = { type: login.pending.type };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен сохранить пользователя и установить isAuthChecked=true при успешном входе', () => {
      const action = {
        type: login.fulfilled.type,
        payload: MOCK_USER
      };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.user).toEqual(MOCK_USER);
      expect(newState.isAuthChecked).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен установить ошибку при неудачном входе', () => {
      const action = {
        type: login.rejected.type,
        error: { message: apiResponses.loginError.message }
      };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(apiResponses.loginError.message);
      expect(newState.user).toBe(null);
    });

    it('должен использовать стандартное сообщение, если ошибка входа не содержит текста', () => {
      const action = {
        type: login.rejected.type,
        error: {}
      };
      const newState = userReducer(state, action);

      expect(newState.error).toBe('Ошибка входа');
    });
  });

  describe('регистрация (register)', () => {
    it('должен установить loading=true при начале регистрации', () => {
      const action = { type: register.pending.type };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен сохранить пользователя при успешной регистрации', () => {
      const action = {
        type: register.fulfilled.type,
        payload: MOCK_USER
      };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.user).toEqual(MOCK_USER);
      expect(newState.isAuthChecked).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен установить ошибку при неудачной регистрации', () => {
      const errorMessage = 'Ошибка регистрации';
      const action = {
        type: register.rejected.type,
        error: { message: errorMessage }
      };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.user).toBe(null);
    });
  });

  describe('получение пользователя (getUser)', () => {
    it('должен установить loading=true при начале получения', () => {
      const action = { type: getUser.pending.type };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(true);
    });

    it('должен сохранить пользователя при успешном получении', () => {
      const action = {
        type: getUser.fulfilled.type,
        payload: MOCK_USER
      };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.user).toEqual(MOCK_USER);
      expect(newState.isAuthChecked).toBe(true);
    });

    it('должен сбросить пользователя при ошибке получения', () => {
      const action = { type: getUser.rejected.type };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.user).toBe(null);
      expect(newState.isAuthChecked).toBe(true);
    });
  });

  describe('обновление пользователя (updateUser)', () => {
    it('должен установить loading=true при начале обновления', () => {
      const action = { type: updateUser.pending.type };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBe(null);
    });

    it('должен обновить данные пользователя при успешном обновлении', () => {
      const action = {
        type: updateUser.fulfilled.type,
        payload: UPDATED_USER
      };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.user).toEqual(UPDATED_USER);
      expect(newState.error).toBe(null);
    });

    it('должен установить ошибку при неудачном обновлении', () => {
      const errorMessage = 'Ошибка обновления';
      const action = {
        type: updateUser.rejected.type,
        error: { message: errorMessage }
      };
      const newState = userReducer(state, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });
  });

  describe('выход (logout)', () => {
    it('должен очистить пользователя при выходе', () => {
      const loginAction = {
        type: login.fulfilled.type,
        payload: MOCK_USER
      };
      const stateWithUser = userReducer(state, loginAction);
      const logoutAction = { type: logout.fulfilled.type };
      const newState = userReducer(stateWithUser, logoutAction);

      expect(newState.user).toBe(null);
    });
  });

  describe('восстановление пароля', () => {
    it('должен обрабатывать forgotPassword.fulfilled без изменения состояния', () => {
      const action = { type: forgotPassword.fulfilled.type };
      const newState = userReducer(state, action);

      expect(newState).toEqual(initialState);
    });

    it('должен обрабатывать resetPassword.fulfilled без изменения состояния', () => {
      const action = { type: resetPassword.fulfilled.type };
      const newState = userReducer(state, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('редюсеры (reducers)', () => {
    it('должен установить isAuthChecked=true при вызове authChecked', () => {
      const action = { type: authChecked.type };
      const newState = userReducer(state, action);

      expect(newState.isAuthChecked).toBe(true);
    });

    it('должен очистить ошибку при вызове clearError', () => {
      const errorAction = {
        type: login.rejected.type,
        error: { message: 'Some error' }
      };
      const stateWithError = userReducer(state, errorAction);
      const clearAction = { type: clearError.type };
      const newState = userReducer(stateWithError, clearAction);

      expect(newState.error).toBe(null);
    });
  });

  describe('граничные случаи', () => {
    it('должен сохранять данные пользователя при повторной загрузке', () => {
      const loginAction = {
        type: login.fulfilled.type,
        payload: MOCK_USER
      };
      const stateWithUser = userReducer(state, loginAction);
      const pendingAction = { type: updateUser.pending.type };
      const newState = userReducer(stateWithUser, pendingAction);

      expect(newState.loading).toBe(true);
      expect(newState.user).toEqual(MOCK_USER);
    });

    it('должен корректно обрабатывать несколько последовательных загрузок', () => {
      let currentState = userReducer(state, { type: login.pending.type });
      expect(currentState.loading).toBe(true);

      currentState = userReducer(currentState, { type: login.pending.type });
      expect(currentState.loading).toBe(true);

      const errorAction = {
        type: login.rejected.type,
        error: { message: 'Ошибка 1' }
      };
      currentState = userReducer(currentState, errorAction);
      expect(currentState.loading).toBe(false);
      expect(currentState.error).toBe('Ошибка 1');

      currentState = userReducer(currentState, { type: login.pending.type });
      expect(currentState.loading).toBe(true);
      expect(currentState.error).toBe(null);
    });

    it('должен сбрасывать ошибку при новой успешной авторизации', () => {
      const errorAction = {
        type: login.rejected.type,
        error: { message: 'Ошибка' }
      };
      const stateWithError = userReducer(state, errorAction);
      expect(stateWithError.error).toBe('Ошибка');

      const successAction = {
        type: login.fulfilled.type,
        payload: MOCK_USER
      };
      const newState = userReducer(stateWithError, successAction);

      expect(newState.error).toBe(null);
      expect(newState.user).toEqual(MOCK_USER);
    });
  });

  describe('вызов API', () => {
    it('должен корректно обрабатывать успешный вход', async () => {
      (loginUserApi as jest.Mock).mockResolvedValue(apiResponses.loginSuccess);

      const thunk = login(LOGIN_DATA);
      const result = await thunk(
        jest.fn(),
        () => ({ user: initialState }),
        undefined
      );

      expect(login.fulfilled.match(result)).toBe(true);
      if (login.fulfilled.match(result)) {
        expect(result.payload).toEqual(MOCK_USER);
      }
      expect(loginUserApi).toHaveBeenCalledWith(LOGIN_DATA);
    });

    it('должен корректно обрабатывать ошибку входа', async () => {
      (loginUserApi as jest.Mock).mockRejectedValue(
        new Error(apiResponses.loginError.message)
      );

      const thunk = login(LOGIN_DATA);
      const result = await thunk(
        jest.fn(),
        () => ({ user: initialState }),
        undefined
      );

      expect(login.rejected.match(result)).toBe(true);
    });

    it('должен корректно обрабатывать успешную регистрацию', async () => {
      (registerUserApi as jest.Mock).mockResolvedValue(
        apiResponses.loginSuccess
      );

      const thunk = register(REGISTER_DATA);
      const result = await thunk(
        jest.fn(),
        () => ({ user: initialState }),
        undefined
      );

      expect(register.fulfilled.match(result)).toBe(true);
      if (register.fulfilled.match(result)) {
        expect(result.payload).toEqual(MOCK_USER);
      }
      expect(registerUserApi).toHaveBeenCalledWith(REGISTER_DATA);
    });

    it('должен корректно обрабатывать успешное получение пользователя', async () => {
      (getUserApi as jest.Mock).mockResolvedValue({ user: MOCK_USER });

      const thunk = getUser();
      const result = await thunk(
        jest.fn(),
        () => ({ user: initialState }),
        undefined
      );

      expect(getUser.fulfilled.match(result)).toBe(true);
      if (getUser.fulfilled.match(result)) {
        expect(result.payload).toEqual(MOCK_USER);
      }
      expect(getUserApi).toHaveBeenCalled();
    });

    it('должен корректно обрабатывать успешное обновление пользователя', async () => {
      (updateUserApi as jest.Mock).mockResolvedValue({ user: UPDATED_USER });

      const thunk = updateUser(UPDATE_DATA);
      const result = await thunk(
        jest.fn(),
        () => ({ user: { ...initialState, user: MOCK_USER } }),
        undefined
      );

      expect(updateUser.fulfilled.match(result)).toBe(true);
      if (updateUser.fulfilled.match(result)) {
        expect(result.payload).toEqual(UPDATED_USER);
      }
      expect(updateUserApi).toHaveBeenCalledWith(UPDATE_DATA);
    });

    it('должен корректно обрабатывать успешный выход', async () => {
      (logoutApi as jest.Mock).mockResolvedValue({ success: true });

      const thunk = logout();
      const result = await thunk(
        jest.fn(),
        () => ({ user: { ...initialState, user: MOCK_USER } }),
        undefined
      );

      expect(logout.fulfilled.match(result)).toBe(true);
      expect(logoutApi).toHaveBeenCalled();
    });

    it('должен корректно обрабатывать forgotPassword', async () => {
      (forgotPasswordApi as jest.Mock).mockResolvedValue({ success: true });

      const thunk = forgotPassword(TEST_EMAIL);
      const result = await thunk(
        jest.fn(),
        () => ({ user: initialState }),
        undefined
      );

      expect(forgotPassword.fulfilled.match(result)).toBe(true);
      expect(forgotPasswordApi).toHaveBeenCalledWith({ email: TEST_EMAIL });
    });

    it('должен корректно обрабатывать resetPassword', async () => {
      (resetPasswordApi as jest.Mock).mockResolvedValue({ success: true });

      const thunk = resetPassword(RESET_DATA);
      const result = await thunk(
        jest.fn(),
        () => ({ user: initialState }),
        undefined
      );

      expect(resetPassword.fulfilled.match(result)).toBe(true);
      expect(resetPasswordApi).toHaveBeenCalledWith(RESET_DATA);
    });
  });
});
