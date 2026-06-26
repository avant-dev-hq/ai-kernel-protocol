import pg from 'pg';

const { Pool } = pg;

let _pool: InstanceType<typeof Pool> | null = null;

export function getPool(): InstanceType<typeof Pool> {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    _pool.on('error', (err) => {
      console.error('[pool] idle client error', err.message);
    });
  }
  return _pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await getPool().query(sql, params);
  return rows as T[];
}
