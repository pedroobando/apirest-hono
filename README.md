# apirest-hono

Una apirest, que se conecta a drizzle con una base de datos D1 de cloudflare

## Cloudflare

tambien existen una serie de comando o funciones que pueden ser trabajados desde consola con wrangler, con este comando podemos ver todo lo que podemos hacer desde consola.

```
pnpm wrangler --help
```

### Cloudflate Worker

Para hacer el deploy en worker:

```
pnpm wrangler deploy --name apiresthono
```

### worker-configuration

Con este comando generamos el archivo `worker-configuration.d.ts`, este nos permitira manejar la configuracion de los servicios de cloudflare me diante typescript

```
pnpm typegen
```

### Database D1

Vamos a crear la base de datos

```
pnpm wrangler d1 create blogDB
```

Wrangler nos crea esta configuracion y la agrega al archivo `wrangler.jsonc` To access your new D1 Database in your Worker, add the following snippet to your configuration file:

```
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "blogDB",
      "database_id": "c0xxxxxxx-xxxx-4de1-ae83-xxxxxxxxxxxxx"
    }
  ]
}
```

vamos a utilizar el archivo `wranfler.jsonc' en cual trae por defecto hono

> [note!] Nota a considerar existe un archivo llamado .dev.vars, donde puedes colocar variables para la aplicacion, todas estas variables son privadas, solo seran vistas por la aplicacion.- Variables de seguridad.

## Drizzle

Instalacion de drizzle

```
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

### drizzle.config.ts

Creacion del archivo `drizzle.config.ts`, el cual dejamos en el direcctorio raiz de nuestra apps.

```
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: 'drizzle/migrations',
  dialect: 'sqlite',
  schema: 'src/db/schema.ts',
});
```

#### schema.ts

Creamos el archivo `src/db/schema.ts` cargamos los datos para nuestra base de datos.

```
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  // id is autoincremental
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fullname: text('fullname').notNull(),
  email: text('email').notNull(),
  password: text().notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
```

### modificacion de package.json

Agregamos estas lineas al pagkege.json, con el objetivo de generar las tablas y migraciones

```
    "db:generate": "drizzle-kit generate",
    "db:up": "drizzle-kit up:sqlite"
```

### Generacion de Schema

```
pnpm db:generate
```

### Local - D1

Genera localmente la base de datos en nuestro cpu

```
pnpm wrangler d1 execute blogDB  --local --file=./drizzle/migrations/0000_naive_phil_sheldon.sql
```

### Remote - D1

Genera en remotamente la base de datos en cloudflare

```
pnpm wrangler d1 execute blogDB  --remote --file=./drizzle/migrations/0000_naive_phil_sheldon.sql
```

### Modificacion variable

Al agregar, cambiar o eliminar alguna variable, en los archivos `wrangler.jsonc` o `dev.vars`, recuerde actualizar el archivo `worker-configuration.d.ts`, mediante el comando

```
pnpm wrangler types
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
