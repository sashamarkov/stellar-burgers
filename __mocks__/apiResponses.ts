import { TUser } from '../src/utils/types';

export const loginSuccess = {
  success: true,
  user: {
    email: "test@test.com",
    name: "Test User"
  } as TUser,
  accessToken: "Bearer test-access-token",
  refreshToken: "test-refresh-token"
};

export const loginError = {
  success: false,
  message: "email или пароль введены неверно"
};