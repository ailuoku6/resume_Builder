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

const buildDisplayName = (record: Pick<UserRecord, 'email' | 'display_name' | 'id' | 'created_at'>): AuthUser => {
  return {
    id: record.id,
    email: record.email,
    displayName: record.display_name || record.email.split('@')[0] || '用户',
    createdAt: record.created_at,
  };
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
    `
      SELECT id, email, display_name, password_hash, password_salt, created_at, updated_at
      FROM ${USERS_TABLE}
      WHERE email = ?1
    `,
  )
    .bind(normalizeEmail(email))
    .first<UserRecord>();

  return user ?? null;
};

export const findUserById = async (env: Bindings, userId: string): Promise<UserRecord | null> => {
  const user = await env.RESUME_DB.prepare(
    `
      SELECT id, email, display_name, password_hash, password_salt, created_at, updated_at
      FROM ${USERS_TABLE}
      WHERE id = ?1
    `,
  )
    .bind(userId)
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
  const displayName = normalizedEmail.split('@')[0] || '用户';

  await ctx.env.RESUME_DB.prepare(
    `
      INSERT INTO ${USERS_TABLE} (id, email, display_name, password_hash, password_salt, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
    `,
  )
    .bind(
      userId,
      normalizedEmail,
      displayName,
      passwordRecord.passwordHash,
      passwordRecord.passwordSalt,
      now,
    )
    .run();

  return buildAuthResult(ctx.env, {
    id: userId,
    email: normalizedEmail,
    displayName,
    createdAt: now,
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

  return buildAuthResult(ctx.env, buildDisplayName(user));
};

export const getProfile = async (ctx: ServiceContext, userId: string): Promise<AuthUser | null> => {
  const user = await findUserById(ctx.env, userId);

  if (!user) {
    return null;
  }

  return buildDisplayName(user);
};

export const updateProfile = async (
  ctx: ServiceContext,
  userId: string,
  displayName: string,
): Promise<AuthUser | null> => {
  const trimmedName = displayName.trim();
  const user = await findUserById(ctx.env, userId);

  if (!user) {
    return null;
  }

  await ctx.env.RESUME_DB.prepare(
    `UPDATE ${USERS_TABLE} SET display_name = ?1, updated_at = ?2 WHERE id = ?3`,
  )
    .bind(trimmedName, Date.now(), userId)
    .run();

  return {
    ...buildDisplayName(user),
    displayName: trimmedName || user.email.split('@')[0] || '用户',
  };
};

export const changePassword = async (
  ctx: ServiceContext,
  userId: string,
  currentPassword: string,
  nextPassword: string,
): Promise<'invalid-password' | 'user-not-found' | true> => {
  const user = await findUserById(ctx.env, userId);

  if (!user) {
    return 'user-not-found';
  }

  const valid = await verifyPassword(currentPassword, user.password_hash, user.password_salt);

  if (!valid) {
    return 'invalid-password';
  }

  const passwordRecord = await createPasswordRecord(nextPassword);

  await ctx.env.RESUME_DB.prepare(
    `
      UPDATE ${USERS_TABLE}
      SET password_hash = ?1, password_salt = ?2, updated_at = ?3
      WHERE id = ?4
    `,
  )
    .bind(passwordRecord.passwordHash, passwordRecord.passwordSalt, Date.now(), userId)
    .run();

  return true;
};
