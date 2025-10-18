import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import * as path from 'path';
const envFiles = ['.env.development.local', '.env.development', '.env'];

console.log(process.env.DATABASE_URL, envFiles);

export default defineConfig({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
//   dbName: 'synledger',
  clientUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/synledger',
  debug: true,
  extensions: [Migrator],
  migrations: {
    path: path.join(__dirname, './migrations'),
    glob: '!(*.d).{js,ts}',
  },
  driverOptions: {
    connection: {
      ssl: { rejectUnauthorized: false },
    },
  },
});