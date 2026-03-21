import type { AuthSessionPayload, AuthUser } from '@/entities/auth/model/types';

import { requestJson } from './http';

interface AuthApiResponse {
  result: true;
  token: string;
  user: AuthUser;
}

interface AuthSessionResponse {
  result: true;
  user: AuthUser;
}

export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<AuthSessionPayload> => {
  const response = await requestJson<AuthApiResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return {
    token: response.token,
    user: response.user,
  };
};

export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<AuthSessionPayload> => {
  const response = await requestJson<AuthApiResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return {
    token: response.token,
    user: response.user,
  };
};

export const loadAuthSession = async (): Promise<AuthUser> => {
  const response = await requestJson<AuthSessionResponse>('/api/auth/session', undefined, {
    auth: true,
  });

  return response.user;
};
