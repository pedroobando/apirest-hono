import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: 'drizzle/migrations',
  dialect: 'sqlite',
  schema: './src/db/schema',
});
