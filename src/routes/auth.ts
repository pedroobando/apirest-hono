import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { generateToken } from '../utils/jwt';
import { createUser, findUserByEmail, User } from '../models/user';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

type Env = {
  JWT_SECRET: string;
  // DB: D1Database;
};

type Variables = {
  db2: DrizzleD1Database<typeof schema>;
};

const authRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Registro de usuario
authRoute.post('/register', async (c) => {
  try {
    const { fullname, email, password } = await c.req.json<Omit<User, 'id' | 'active'>>();
    const { JWT_SECRET } = c.env;

    // Validaciones básicas
    if (!fullname || !email || !password) {
      return c.json({ error: 'Todos los campos son obligatorios' }, 400);
    }

    // Verificar si el usuario ya existe
    if (findUserByEmail(email)) {
      return c.json({ error: 'El usuario ya existe' }, 409);
    }

    // Crear usuario (en una app real, la contraseña debería estar hasheada)
    const db = c.get('db2');
    const user = await createUser(db, { fullname, email, password });

    // Generar token JWT
    const token = await generateToken(JWT_SECRET, { id: user.id, email: user.email });

    return c.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          active: user.active,
        },
        token,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Login de usuario
authRoute.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);

    if (!email || !password) {
      return c.json({ error: 'Email y contraseña son obligatorios' }, 400);
    }

    // Buscar usuario
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    if (!user.active) {
      return c.json({ error: 'Usuario inactivo - contacta a soporte' }, 401);
    }

    // Generar token JWT
    const token = await generateToken(JWT_SECRET, { id: user.id, email: user.email });

    return c.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        active: user.active,
      },
      token,
    });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

export default authRoute;
