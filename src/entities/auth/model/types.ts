export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
}

export interface AuthSessionPayload {
  token: string;
  user: AuthUser;
}

export interface CloudDraftSummary {
  draftId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}
