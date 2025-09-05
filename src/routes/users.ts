import { dbFactory } from '../main-factory';

import { authMiddleware } from '../middleware/auth-midlleware';
import { findUserById, updateUser, deleteUser, User, findUserAll, findUserByEmail } from '../models/user';

const userRoute = dbFactory.createApp();

// Obtener perfil de usuario (requiere autenticación)
userRoute.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.get('db');
    const user = await findUserById(db, id);

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

userRoute.get('/email/:email', authMiddleware, async (c) => {
  try {
    const email = c.req.param('email');
    const db = c.get('db');
    const user = await findUserByEmail(db, email.toLowerCase());

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

userRoute.get('/', authMiddleware, async (c) => {
  try {
    const db = c.get('db');
    const user = await findUserAll(db);

    if (!user.length) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Actualizar usuario (requiere autenticación)
userRoute.patch('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();

    const { password, active, ...restUpdate } = await c.req.json<Partial<Omit<User, 'id'>>>();

    const db = c.get('db');
    const updatedUser = await updateUser(db, id, restUpdate);

    if (!updatedUser) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Eliminar usuario (requiere autenticación)
userRoute.delete('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const db = c.get('db');
    const deleted = await deleteUser(db, id);

    if (!deleted) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    return c.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

export default userRoute;
