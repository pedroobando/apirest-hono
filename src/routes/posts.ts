import { dbFactory } from '../main-factory';
import { authMiddleware } from '../middleware/auth-middleware';

import { createPost, findPostsByUser, updatePost, deletePost, Post } from '../models/post';

const postsRoute = dbFactory.createApp();

// Crear un nuevo post (requiere autenticación)
postsRoute.post('/', authMiddleware, async (c) => {
  try {
    const { title, content } = await c.req.json<Omit<Post, 'active' | 'createdAt' | 'updatedAt' | 'authorId'>>();

    if (!title || !content) {
      return c.json({ error: 'Título y contenido son obligatorios' }, 400);
    }

    const db = c.get('db');
    const user = c.get('jwtPayload')!;

    const newPost = await createPost(db, {
      title,
      content,
      authorId: user.id,
    });

    if (!newPost) return c.json({ error: 'Error creando el post.!' }, 500);

    return c.json(
      {
        message: 'Post creado exitosamente',
        post: {
          id: newPost.id,
          title: newPost.title,
          content: newPost.content,
          active: newPost.active,
          createdAt: newPost.createdAt,
          updatedAt: newPost.updatedAt,
          authorId: newPost.authorId,
        },
      },
      201,
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Obtener todos los posts del usuario (requiere autenticación)
postsRoute.get('/', authMiddleware, async (c) => {
  try {
    const db = c.get('db');
    const user = c.get('jwtPayload')!;

    const userPosts = await findPostsByUser(db, user.id);

    return c.json({
      posts: userPosts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        active: post.active,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId,
      })),
    });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Actualizar un post (requiere autenticación)
postsRoute.put('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const { content, active, title } = await c.req.json<Partial<Omit<Post, 'id' | 'authorId'>>>();

    // const { title, content, active } = await c.req.json<
    //   Partial<Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    // >();

    const db = c.get('db');
    // Verificar que el post pertenezca al usuario
    const userPost = await findPostsByUser(db, id);
    if (!userPost) {
      return c.json({ error: 'Posts no encontrado' });
    }

    const updPost = await updatePost(db, id, { content, active, title });
    if (!updPost) {
      return c.json({ error: `Error al actualizar el post - ${id}` });
    }

    return c.json({
      message: 'Post actualizado exitosamente',
      post: {
        id: updPost.id,
        title: updPost.title,
        content: updPost.content,
        active: updPost.active,
        createdAt: updPost.createdAt,
        updatedAt: updPost.updatedAt,
        // userId: updPost.userId,
      },
    });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Eliminar un post (requiere autenticación)
postsRoute.delete('/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();

    const db = c.get('db');
    const deleted = await deletePost(db, id);
    if (!deleted) {
      return c.json({ error: 'Error al eliminar el post' }, 404);
    }

    return c.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

export default postsRoute;
