// lib/db.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Env = {
  // JWT_SECRET: string;
  DB: D1Database;
};

// const authRoute = new Hono<{ Bindings: Env }>();

export const createDb = (d1: D1Database) => drizzle(d1, { schema });

// Para uso en funciones serverless/edge
export function getDb(d1: D1Database) {
  return createDb(d1);
}
