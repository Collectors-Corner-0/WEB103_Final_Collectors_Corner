import './dotenv.js';
import pg from 'pg';

const pool = new pg.Pool({
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

export default pool;
