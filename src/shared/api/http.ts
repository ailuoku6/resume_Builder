import { authStore } from '@/entities/auth/model/auth-store';

interface ApiFailurePayload {
  message?: string;
  result?: boolean;
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export const requestJson = async <T>(
  input: string,
  init?: RequestInit,
  options?: { auth?: boolean },
): Promise<T> => {
  const headers = new Headers(init?.headers ?? {});

  headers.set('Accept', 'application/json');

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options?.auth) {
    if (!authStore.token) {
      throw new ApiRequestError('Unauthorized.', 401);
    }

    headers.set('Authorization', `Bearer ${authStore.token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as (ApiFailurePayload & Partial<T>) | null;

  if (!response.ok || !payload?.result) {
    throw new ApiRequestError(payload?.message ?? 'Request failed.', response.status);
  }

  return payload as T;
};
