import { mainFactory } from './main-factory';
import authRoute from './routes/auth';
import userRoute from './routes/users';
import postRoute from './routes/posts';

import userView from './view/users-view';

const app = mainFactory.createApp();

// Rutas
app.route('/auth', authRoute);
app.route('/user', userRoute);
app.route('/posts', postRoute);
app.route('/view', userView);

// Ruta de salud
app.get('/', (c) => {
  return c.json({ message: 'API Hono.js con JWT & drizzle' });
});

export default app;
