import { ObservableClass, computed } from 'kisstate';

import { AUTH_SESSION_STORAGE_KEY } from './constants';
import type { AuthSessionPayload, AuthUser, CloudDraftSummary } from './types';

const parseSession = (value: string | null): AuthSessionPayload | null => {
  if (!value) {
    return null;
  }

  try {
    const payload = JSON.parse(value) as Partial<AuthSessionPayload>;

    if (!payload.token || !payload.user?.id || !payload.user?.email) {
      return null;
    }

    return {
      token: payload.token,
      user: {
        id: payload.user.id,
        email: payload.user.email,
      },
    };
  } catch (error) {
    console.warn('Failed to parse auth session.', error);
    return null;
  }
};

@ObservableClass
export class AuthStore {
  token: string | null = null;

  user: AuthUser | null = null;

  authDialogOpen = false;

  draftsDrawerOpen = false;

  drafts: CloudDraftSummary[] = [];

  draftsLoading = false;

  constructor() {
    this.loadSession();
  }

  @computed('token', 'user')
  get isAuthenticated(): boolean {
    return Boolean(this.token && this.user);
  }

  setSession(token: string, user: AuthUser): void {
    this.token = token;
    this.user = user;

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        AUTH_SESSION_STORAGE_KEY,
        JSON.stringify({
          token,
          user,
        }),
      );
    }
  }

  clearSession(): void {
    this.token = null;
    this.user = null;
    this.drafts = [];
    this.draftsDrawerOpen = false;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  openAuthDialog(): void {
    this.authDialogOpen = true;
  }

  closeAuthDialog(): void {
    this.authDialogOpen = false;
  }

  openDraftsDrawer(): void {
    this.draftsDrawerOpen = true;
  }

  closeDraftsDrawer(): void {
    this.draftsDrawerOpen = false;
  }

  setDraftsLoading(value: boolean): void {
    this.draftsLoading = value;
  }

  setDrafts(value: CloudDraftSummary[]): void {
    this.drafts = value;
  }

  private loadSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const payload = parseSession(localStorage.getItem(AUTH_SESSION_STORAGE_KEY));

    if (!payload) {
      return;
    }

    this.token = payload.token;
    this.user = payload.user;
  }
}

export const authStore = new AuthStore();
