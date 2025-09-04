import { v4 as uuidv4 } from 'uuid';

export interface Post {
  id: string;
  title: string;
  content: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Almacenamiento en memoria (temporal)
export const posts: Post[] = [];

export const createPost = (postData: Omit<Post, 'id' | 'active' | 'createdAt' | 'updatedAt'>): Post => {
  const newPost: Post = {
    id: uuidv4(),
    ...postData,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  posts.push(newPost);
  return newPost;
};

export const findPostById = (id: string): Post | undefined => {
  return posts.find((post) => post.id === id);
};

export const findPostsByUser = (userId: string): Post[] => {
  return posts.filter((post) => post.userId === userId && post.active);
};

export const updatePost = (id: string, updates: Partial<Omit<Post, 'id' | 'userId' | 'createdAt'>>): Post | null => {
  const postIndex = posts.findIndex((post) => post.id === id);
  if (postIndex === -1) return null;

  posts[postIndex] = {
    ...posts[postIndex],
    ...updates,
    updatedAt: new Date(),
  };
  return posts[postIndex];
};

export const deletePost = (id: string): boolean => {
  const postIndex = posts.findIndex((post) => post.id === id);
  if (postIndex === -1) return false;

  posts.splice(postIndex, 1);
  return true;
};
