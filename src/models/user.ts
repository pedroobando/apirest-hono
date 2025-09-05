import { v4 as uuidv4 } from 'uuid';

import { user } from '../db/schema';
import { createDb } from '../db/conndb';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export interface User {
  id: string;
  fullname: string;
  email: string;
  password: string;
  active: boolean;
}

// Almacenamiento en memoria (temporal)
export const users: User[] = [];

export const createUser = async (
  db: DrizzleD1Database<typeof schema>,
  userData: Omit<User, 'id' | 'active'>,
): Promise<User> => {
  const newUser: User = {
    id: uuidv4(),
    ...userData,
    active: true,
  };
  users.push(newUser);

  // const db = drizzle(DB);
  // const db = getDb(DB);
  // const db = createDb(DB);
  const newUserDb = await db
    .insert(user)
    .values({ email: newUser.email, fullname: newUser.fullname, password: newUser.password, active: true });

  console.log(newUserDb.results);

  return newUser;
};

export const findUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export const findUserAll = async (DB: D1Database): Promise<Omit<User, 'password'>[]> => {
  const db = createDb(DB);
  const allUser = await db.select().from(user).orderBy(user.fullname);
  return allUser;
  // return users.map(({ password, ...restUser }) => restUser);
};

export const updateUser = (id: string, updates: Partial<Omit<User, 'id'>>): User | null => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return null;

  users[userIndex] = { ...users[userIndex], ...updates };
  return users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return false;

  users.splice(userIndex, 1);
  return true;
};
