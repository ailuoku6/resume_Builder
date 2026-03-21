import type { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';

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

  try {
    const payload = await verify(token, ctx.env.AUTH_JWT_SECRET, 'HS256');
    const userId = typeof payload.sub === 'string' ? payload.sub : null;
    const email = typeof payload.email === 'string' ? payload.email : null;

    if (!userId || !email) {
      throw new Error('Invalid token payload.');
    }

    ctx.set('authUser', {
      id: userId,
      email,
    });

    await next();
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
};
