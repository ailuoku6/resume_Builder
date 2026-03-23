import type { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';

import { findUserById } from '../service/authService';
import type { Bindings, Variables } from '../types';

type AuthMiddleware = MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }>;

export const authenticate: AuthMiddleware = async (ctx, next) => {
  const authorization = ctx.req.header('Authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  const token = authorization.slice(7).trim();
  let userId: string | null = null;
  let email: string | null = null;

  try {
    const payload = await verify(token, ctx.env.AUTH_JWT_SECRET, 'HS256');
    userId = typeof payload.sub === 'string' ? payload.sub : null;
    email = typeof payload.email === 'string' ? payload.email : null;

    if (!userId || !email) {
      throw new Error('Invalid token payload.');
    }
  } catch (error) {
    console.warn('JWT verification failed.', error);

    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  const user = await findUserById(ctx.env, userId);

  if (!user || user.email !== email) {
    console.warn('Authenticated token points to a missing or mismatched user.', {
      userId,
      email,
    });

    return ctx.json(
      {
        result: false,
        message: 'Unauthorized.',
      },
      401,
    );
  }

  ctx.set('authUser', {
    id: user.id,
    email: user.email,
  });

  await next();
};
