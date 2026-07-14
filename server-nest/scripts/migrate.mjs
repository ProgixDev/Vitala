// Applies supabase/migrations/*.sql in filename order against DATABASE_URL.
// Idempotent-ish: tracks applied files in a _migrations table and skips them.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'supabase', 'migrations');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

await client.connect();
await client.query(
  'create table if not exists public._migrations (name text primary key, applied_at timestamptz default now())',
);

for (const file of files) {
  const { rowCount } = await client.query('select 1 from public._migrations where name = $1', [file]);
  if (rowCount) {
    console.log(`skip   ${file} (already applied)`);
    continue;
  }
  const sql = readFileSync(join(dir, file), 'utf8');
  process.stdout.write(`apply  ${file} ... `);
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('insert into public._migrations(name) values ($1)', [file]);
    await client.query('commit');
    console.log('OK');
  } catch (err) {
    await client.query('rollback');
    console.log('FAILED');
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log('All migrations applied.');
