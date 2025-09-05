import { Hono } from 'hono';
// import { drizzle } from 'drizzle-orm/d1';
import { authMiddleware } from '../middleware/auth';
import { findUserById, updateUser, deleteUser, User, findUserAll } from '../models/user';

export type Env = {
  MY_VAR: string;
  DB: D1Database;
};

const userRoute = new Hono<{ Bindings: Env }>();

// Obtener perfil de usuario (requiere autenticación)
userRoute.get('/:id', authMiddleware, async (c) => {
  try {
    // const jwtPayload = c.get('jwtPayload');

    const id = c.req.param('id');
    const user = findUserById(id);

    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      active: user.active,
    });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

userRoute.get('/', async (c) => {
  try {
    const user = await findUserAll(c.env.DB);

    if (!user.length) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Actualizar usuario (requiere autenticación)
userRoute.put('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userData = await c.req.json();
    const updates = await c.req.json<Partial<Omit<User, 'id'>>>();

    // No permitir actualizar el campo active mediante esta ruta
    if ('active' in updates) {
      delete updates.active;
    }

    const updatedUser = updateUser(id, updates);

    if (!updatedUser) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: updatedUser.id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        active: updatedUser.active,
      },
    });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Eliminar usuario (requiere autenticación)
userRoute.delete('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const deleted = deleteUser(id);

    if (!deleted) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

export default userRoute;
