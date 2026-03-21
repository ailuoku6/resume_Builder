import type { MiddlewareHandler } from 'hono';

const errorHandle: MiddlewareHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Cloudflare API request failed.', error);

    return ctx.json(
      {
        result: false,
        message: 'Cloudflare backend request failed.',
      },
      500,
    );
  }
};

export default errorHandle;
