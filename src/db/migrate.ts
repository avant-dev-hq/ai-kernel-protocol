import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getPool } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const pool = getPool();

  console.log('[migrate] running schema.sql...');
  const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(schemaSql);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS meta.schema_migrations (
      id         SERIAL      PRIMARY KEY,
      filename   TEXT        NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = join(__dirname, 'migrations');
  let files: string[] = [];
  try {
    files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  } catch { /* no migrations dir yet */ }

  for (const file of files) {
    const { rows } = await pool.query<{ exists: boolean }>(
      `SELECT 1 AS exists FROM meta.schema_migrations WHERE filename = $1`, [file]
    );
    if (rows.length) { console.log(`[migrate] skip ${file}`); continue; }
    console.log(`[migrate] applying ${file}...`);
    await pool.query(readFileSync(join(migrationsDir, file), 'utf-8'));
    await pool.query(`INSERT INTO meta.schema_migrations (filename) VALUES ($1)`, [file]);
    console.log(`[migrate] applied ${file}`);
  }

  console.log('[migrate] done');
  await pool.end();
}

migrate().catch(err => { console.error('[migrate] failed:', err.message); process.exit(1); });
