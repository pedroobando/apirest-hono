// schema.ts
import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps } from './colunms.helpers';
import { user } from './user';

export const posts = sqliteTable(
  'posts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    content: text('content'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    authorId: text('authorid').notNull(),

    ...timestamps,
  },
  (table) => [index('email_idx').on(table.authorId)],
);

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(user, {
    fields: [posts.authorId],
    references: [user.id],
  }),
}));
