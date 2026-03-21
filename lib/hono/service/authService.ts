import { sign } from 'hono/jwt';

import { createPasswordRecord, verifyPassword } from '../utils/crypto';
import type { AuthResult, AuthUser, Bindings, UserRecord } from '../types';

interface ServiceContext {
  env: Bindings;
}

const USERS_TABLE = 'resume_users';

const normalizeEmail = (value: string): string => {
  return value.trim().toLowerCase();
};

const createToken = async (env: Bindings, user: AuthUser): Promise<string> => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;

  return sign(
    {
      sub: user.id,
      email: user.email,
      exp: expiresAt,
    },
    env.AUTH_JWT_SECRET,
  );
};

const findUserByEmail = async (env: Bindings, email: string): Promise<UserRecord | null> => {
  const user = await env.RESUME_DB.prepare(
    `SELECT id, email, password_hash, password_salt, created_at, updated_at FROM ${USERS_TABLE} WHERE email = ?1`,
  )
    .bind(normalizeEmail(email))
    .first<UserRecord>();

  return user ?? null;
};

const buildAuthResult = async (env: Bindings, user: AuthUser): Promise<AuthResult> => {
  return {
    token: await createToken(env, user),
    user,
  };
};

export const signUp = async (
  ctx: ServiceContext,
  email: string,
  password: string,
): Promise<AuthResult | 'email-exists'> => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findUserByEmail(ctx.env, normalizedEmail);

  if (existingUser) {
    return 'email-exists';
  }

  const now = Date.now();
  const userId = crypto.randomUUID();
  const passwordRecord = await createPasswordRecord(password);

  await ctx.env.RESUME_DB.prepare(
    `
      INSERT INTO ${USERS_TABLE} (id, email, password_hash, password_salt, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?5)
    `,
  )
    .bind(userId, normalizedEmail, passwordRecord.passwordHash, passwordRecord.passwordSalt, now)
    .run();

  return buildAuthResult(ctx.env, {
    id: userId,
    email: normalizedEmail,
  });
};

export const login = async (
  ctx: ServiceContext,
  email: string,
  password: string,
): Promise<AuthResult | null> => {
  const user = await findUserByEmail(ctx.env, email);

  if (!user) {
    return null;
  }

  const valid = await verifyPassword(password, user.password_hash, user.password_salt);

  if (!valid) {
    return null;
  }

  return buildAuthResult(ctx.env, {
    id: user.id,
    email: user.email,
  });
};
