import { verifyToken } from '../utils/jwt';

import { createFactory } from 'hono/factory';

export type Env = {
  JWT_SECRET: string;
  Variables: {
    foo: string;
  };
};

const authFactory = createFactory<{ Bindings: Env }>();

export const authMiddleware = authFactory.createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return c.json({ error: 'Token de acceso requerido' }, 401);
  }
  const token = authHeader.substring(7);

  try {
    const decoded = await verifyToken(c.env.JWT_SECRET, token);
    c.set('jwtPayload', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Token inválido o expirado' }, 401);
  }
});
