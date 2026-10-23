
import 'dotenv/config';
import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'ferrearmijos_db',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000
});

pool.on('error', (error: Error) => {
  console.error('Error inesperado en la conexión PostgreSQL:', error);
});
