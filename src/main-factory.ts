// src/factory.ts
import { logger } from 'hono/logger';
import { createFactory } from 'hono/factory';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';

import * as schema from './db/schema';
import { corsMiddleware } from './middleware/cors-middleware';

type Env = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
  };
  Variables: {
    db: DrizzleD1Database<typeof schema> & { $client: D1Database };
  };
};

export const mainFactory = createFactory<Env>({
  initApp: (app) => {
    app.use('*', logger());
    app.use('*', corsMiddleware);
  },
});

export const dbFactory = createFactory<Env>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = drizzle(c.env.DB, { schema });
      c.set('db', db);
      await next();
    });
  },
});
