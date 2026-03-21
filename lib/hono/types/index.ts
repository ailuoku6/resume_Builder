import type { ResumeData } from '../../../src/entities/resume/model/types';

export type Bindings = {
  RESUME_DB: D1Database;
  AUTH_JWT_SECRET: string;
  RESUME_ENCRYPTION_SECRET: string;
};

export interface AuthIdentity {
  id: string;
  email: string;
}

export interface AuthUser extends AuthIdentity {
  displayName: string;
  createdAt: number;
}

export type Variables = {
  authUser: AuthIdentity;
};

export interface ResumeDraftRecord {
  id: string;
  user_id: string;
  encrypted_payload: string;
  payload_iv: string;
  created_at: number;
  updated_at: number;
}

export interface ResumeDraftResult {
  draftId: string;
  updatedAt: number;
  data: ResumeData;
}

export interface ResumeDraftSummary {
  draftId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserRecord {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  password_salt: string;
  created_at: number;
  updated_at: number;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}
