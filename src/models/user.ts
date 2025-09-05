import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DzD1Database } from '../db/conndb';

import { user } from '../db/schema';

export interface User {
  id: string;
  fullname: string;
  email: string;
  password: string;
  active: boolean;
}

export const createUser = async (
  db: DzD1Database,
  userData: Omit<User, 'id' | 'active'>,
): Promise<Omit<User, 'password' | 'createAt' | 'updateAt'>> => {
  const newUser = {
    // id: uuidv4(),
    ...userData,
    email: userData.email.toLowerCase(),
    password: bcrypt.hashSync(userData.password),
    active: true,
  };

  const newUserDb = await db
    .insert(user)
    .values({ ...newUser })
    .returning();

  return newUserDb[0];
};

export const findUserByEmail = async (db: DzD1Database, email: string): Promise<User | undefined> => {
  try {
    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });

    return user;
  } catch (error) {
    return undefined;
  }
};

export const findUserById = async (db: DzD1Database, id: string): Promise<User | undefined> => {
  const user = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  });
  return user;
};

export const findUserAll = async (db: DzD1Database): Promise<Omit<User, 'password'>[]> => {
  const allUser = await db.query.user.findMany({
    columns: {
      id: true,
      fullname: true,
      email: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: (user, { asc }) => [asc(user.fullname)],
  });

  return allUser;
};

export const updateUser = async (
  db: DzD1Database,
  id: string,
  updates: Partial<Omit<User, 'id'>>,
): Promise<{
  id: string;
  fullname: string;
  email: string;
  active: boolean;
  createdAt: Date;
} | null> => {
  const updUser: { id: string; fullname: string; email: string; active: boolean; createdAt: Date }[] = await db
    .update(user)
    .set({ ...updates })
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      active: user.active,
      createdAt: user.createdAt,
    });

  return updUser[0];
};

export const deleteUser = async (db: DzD1Database, id: string): Promise<boolean> => {
  const fUser = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  });

  if (!fUser) return false;
  await db.delete(user).where(eq(user.id, id));
  return true;
};
