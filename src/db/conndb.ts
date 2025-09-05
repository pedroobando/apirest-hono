// lib/db.ts
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

export type DzD1Database = DrizzleD1Database<typeof schema> & { $client: D1Database };
export const createDb = (d1: D1Database) => drizzle(d1, { schema });

// Para uso en funciones serverless/edge
// export function getDb(d1: D1Database) {
//   return createDb(d1);
// }
