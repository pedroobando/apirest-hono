import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

import authRoute from './routes/auth';
import userRoute from './routes/users';
import postRoute from './routes/posts';
import { createDb } from './db/conndb';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './db/schema';

type Env = {
  DB: D1Database;
};

type Variables = {
  db2: DrizzleD1Database<typeof schema>;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middlewares globales
app.use('*', logger());

// Middleware para crear instancia de base de datos
app.use('*', async (c, next) => {
  const db = createDb(c.env.DB);
  c.set('db2', db);
  await next();
});

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

// Rutas
app.route('/auth', authRoute);
app.route('/user', userRoute);
app.route('/posts', postRoute);

// Ruta de salud
app.get('/', (c) => {
  return c.json({ message: 'API Hono.js con JWT' });
});

export default app;
