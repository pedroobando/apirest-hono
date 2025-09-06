// Import required dependencies
import { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt';

// Create authentication middleware
export const authMiddleware = async (c: Context, next: Next) => {
  // Get the authorization header
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token de acceso requerido' }, 401);
  }

  try {
    // Extract and verify the JWT token
    const token = authHeader.split(' ')[1];
    // const payload = await jwt.verify(token, c.env.JWT_SECRET ?? 'uuuu');
    const payload = await verifyToken(c.env.JWT_SECRET, token);

    // Attach user data to context
    c.set('jwtPayload', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Token inválido o expirado' }, 401);
  }
};
