import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { createUser, findUserByEmail, User } from '../models/user';
import { dbFactory } from '../main-factory';

const authRoute = dbFactory.createApp();

// Registro de usuario
authRoute.post('/register', async (c) => {
  try {
    const { fullname, email, password } = await c.req.json<Omit<User, 'id' | 'active'>>();
    const { JWT_SECRET, JWT_EXPIRES } = c.env;

    // Validaciones básicas
    if (!fullname || !email || !password) {
      return c.json({ error: 'Todos los campos son obligatorios' }, 400);
    }

    // Verificar si el usuario ya existe
    const db = c.get('db');
    const findUser = await findUserByEmail(db, email);
    if (findUser) {
      return c.json({ error: 'El usuario ya existe' }, 409);
    }

    // Crear usuario (en una app real, la contraseña debería estar hasheada)
    const user = await createUser(db, { fullname, email, password });

    // Generar token JWT
    const token = await generateToken({ id: user.id, email: user.email }, JWT_SECRET, JWT_EXPIRES);

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
    const { JWT_SECRET, JWT_EXPIRES } = c.env;

    // c.set('user', undefined);
    if (!email || !password) {
      return c.json({ error: 'Email y contraseña son obligatorios' }, 400);
    }

    // Buscar usuario
    const db = c.get('db');
    const user = await findUserByEmail(db, email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    if (!user.active) {
      return c.json({ error: 'Usuario inactivo - contacta a soporte' }, 401);
    }

    // Generar token JWT
    const token = await generateToken({ id: user.id, email: user.email }, JWT_SECRET, JWT_EXPIRES);

    // const pepe = c.get('user');
    // console.log('pepe:', pepe);

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
