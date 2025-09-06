// schema.ts
import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { timestamps } from './colunms.helpers';
import { posts } from './posts';

export const user = sqliteTable(
  'user',
  {
    // id is autoincremental
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    fullname: text('fullname').notNull(),
    email: text('email').unique('email').notNull(),
    password: text().notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),

    ...timestamps,
  },
  (table) => [
    // index("name_idx").on(table.name),
    uniqueIndex('email_idx').on(table.email),
  ],
);

export const usersRelations = relations(user, ({ many }) => ({
  posts: many(posts),
}));
