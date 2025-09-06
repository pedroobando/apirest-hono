import { mainFactory } from './main-factory';
import authRoute from './routes/auth';
import userRoute from './routes/users';
import postRoute from './routes/posts';

const app = mainFactory.createApp();

// Rutas
app.route('/auth', authRoute);
app.route('/user', userRoute);
app.route('/posts', postRoute);

// Ruta de salud
app.get('/', (c) => {
  return c.json({ message: 'API Hono.js con JWT & drizzle' });
});

export default app;
