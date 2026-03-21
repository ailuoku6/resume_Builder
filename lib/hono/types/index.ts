import type { ResumeData } from '../../../src/entities/resume/model/types';

export type Bindings = {
  RESUME_DB: D1Database;
  AUTH_JWT_SECRET: string;
  RESUME_ENCRYPTION_SECRET: string;
};

export interface AuthUser {
  id: string;
  email: string;
}

export type Variables = {
  authUser: AuthUser;
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
  updatedAt: number;
}

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  created_at: number;
  updated_at: number;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}
