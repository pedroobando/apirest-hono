import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

import authRoute from './routes/auth';
import userRoute from './routes/users';
import postRoute from './routes/posts';

const app = new Hono();

// Middlewares globales
app.use('*', logger());
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
