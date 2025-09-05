import { cors } from 'hono/cors';
import { createFactory } from 'hono/factory';

export type Env = {
  CORS_ORIGIN: string[];
};

const corsFactory = createFactory<{ Bindings: Env }>();

export const corsMiddleware = corsFactory.createMiddleware(async (c, next) => {
  try {
    const { CORS_ORIGIN } = c.env;
    const corsMiddlewareHandler = cors({
      origin: [...CORS_ORIGIN],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    return corsMiddlewareHandler(c, next);
  } catch (error) {
    return c.json({ error: 'Cors origin, no valido' }, 401);
  }
});
