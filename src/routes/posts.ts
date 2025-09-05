import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth-midlleware';
import { createPost, findPostsByUser, updatePost, deletePost, Post } from '../models/post';

const postsRoute = new Hono();

// Crear un nuevo post (requiere autenticación)
postsRoute.post('/', authMiddleware, async (c) => {
  try {
    const userData = c.get('jwtPayload');

    const { title, content } = await c.req.json<Omit<Post, 'id' | 'active' | 'createdAt' | 'updatedAt' | 'userId'>>();

    if (!title || !content) {
      return c.json({ error: 'Título y contenido son obligatorios' }, 400);
    }

    const newPost = createPost({
      title,
      content,
      userId: userData.id,
    });

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
          userId: newPost.userId,
        },
      },
      201,
    );
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Obtener todos los posts del usuario (requiere autenticación)
postsRoute.get('/', authMiddleware, async (c) => {
  try {
    const userData = c.get('jwtPayload');
    const userPosts = findPostsByUser(userData.id);

    return c.json({
      posts: userPosts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        active: post.active,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        userId: post.userId,
      })),
    });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Actualizar un post (requiere autenticación)
postsRoute.put('/:id', authMiddleware, async (c) => {
  try {
    const userData = c.get('jwtPayload');
    const postId = c.req.param('id');
    const { title, content, active } = await c.req.json<
      Partial<Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    >();

    // Verificar que el post pertenezca al usuario
    const userPosts = findPostsByUser(userData.id);
    const post = userPosts.find((p) => p.id === postId);

    if (!post) {
      return c.json({ error: 'Post no encontrado' }, 404);
    }

    const updatedPost = updatePost(postId, { title, content, active });

    if (!updatedPost) {
      return c.json({ error: 'Error al actualizar el post' }, 500);
    }

    return c.json({
      message: 'Post actualizado exitosamente',
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        active: updatedPost.active,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        userId: updatedPost.userId,
      },
    });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Eliminar un post (requiere autenticación)
postsRoute.delete('/:id', authMiddleware, async (c) => {
  try {
    const userData = c.get('jwtPayload');
    const postId = c.req.param('id');

    // Verificar que el post pertenezca al usuario
    const userPosts = findPostsByUser(userData.id);
    const post = userPosts.find((p) => p.id === postId);

    if (!post) {
      return c.json({ error: 'Post no encontrado' }, 404);
    }

    const deleted = deletePost(postId);

    if (!deleted) {
      return c.json({ error: 'Error al eliminar el post' }, 500);
    }

    return c.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

export default postsRoute;
