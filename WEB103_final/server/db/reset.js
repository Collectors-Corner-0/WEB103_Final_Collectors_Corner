import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFile(relativePath) {
  const filePath = path.join(__dirname, relativePath);
  const sql = await readFile(filePath, 'utf8');
  await pool.query(sql);
}

async function reset() {
  try {
    await runFile('schema.sql');
    await runFile('seed.sql');
    console.log('Database schema and seed data applied.');
  } finally {
    await pool.end();
  }
}

reset().catch((error) => {
  console.error('Failed to reset database:', error);
  process.exit(1);
});
