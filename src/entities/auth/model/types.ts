export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSessionPayload {
  token: string;
  user: AuthUser;
}

export interface CloudDraftSummary {
  draftId: string;
  name: string;
  updatedAt: number;
}
