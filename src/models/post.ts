import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { DzD1Database } from '../db/conndb';
import { posts, user } from '../db/schema';

export interface Post {
  id: string;
  title: string;
  content?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

export const createPost = async (
  db: DzD1Database,
  postData: Omit<Post, 'id' | 'active' | 'createdAt' | 'updatedAt'>,
): Promise<Post | null> => {
  try {
    const newPost = {
      ...postData,
      active: true,
    };
    const newPostDb = await db
      .insert(posts)
      .values({ ...newPost })
      .returning();

    return newPostDb[0];
  } catch (error) {
    return null;
  }
};

export const findPostById = async (db: DzD1Database, id: string): Promise<Post | undefined> => {
  const post = await db.query.posts.findFirst({ where: (posts, { eq }) => eq(posts.id, id) });

  return post;
};

export const findPostsByUser = async (db: DzD1Database, userId: string): Promise<Post[]> => {
  const posts = await db.query.posts.findMany({ where: (posts, { eq }) => eq(posts.authorId, userId) });

  return posts;
};

export const updatePost = async (
  db: DzD1Database,
  id: string,
  updates: Partial<Omit<Post, 'id' | 'authorId' | 'createdAt'>>,
): Promise<Post | null> => {
  const updPost = await db
    .update(posts)
    .set({ ...updates })
    .where(eq(posts.id, id))
    .returning();

  return updPost[0];
};

export const deletePost = async (db: DzD1Database, id: string): Promise<boolean> => {
  const fPost = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(user.id, id),
  });

  if (!fPost) return false;
  await db.delete(user).where(eq(posts.id, id));
  return true;
};
