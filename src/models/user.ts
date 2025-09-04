import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  fullname: string;
  email: string;
  password: string;
  active: boolean;
}

// Almacenamiento en memoria (temporal)
export const users: User[] = [];

export const createUser = (userData: Omit<User, 'id' | 'active'>): User => {
  const newUser: User = {
    id: uuidv4(),
    ...userData,
    active: true,
  };
  users.push(newUser);
  return newUser;
};

export const findUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export const findUserAll = (): Omit<User, 'password'>[] => {
  return users.map(({ password, ...restUser }) => restUser);
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
