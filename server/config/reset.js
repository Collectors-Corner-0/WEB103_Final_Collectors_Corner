import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function dropAllTables() {
  await pool.query(`
    DROP TABLE IF EXISTS library_entry_tags;
    DROP TABLE IF EXISTS library_entries;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS media;
    DROP TABLE IF EXISTS user_profiles;
    DROP TABLE IF EXISTS users;
  `);
}

async function createUsersTable() {
  await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      githubid INT NOT NULL UNIQUE,
      username VARCHAR(100) NOT NULL,
      avatarurl TEXT,
      accesstoken VARCHAR(500),
      role VARCHAR(20) NOT NULL DEFAULT 'collector' CHECK (role IN ('collector', 'creator')),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function createUserProfilesTable() {
  await pool.query(`
    CREATE TABLE user_profiles (
      user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      display_name TEXT,
      bio TEXT,
      favorite_genres TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function createMediaTable() {
  await pool.query(`
    CREATE TABLE media (
      id SERIAL PRIMARY KEY,
      created_by_user_id INT REFERENCES users(id),
      title VARCHAR(200) NOT NULL,
      creator VARCHAR(200),
      media_type VARCHAR(50) NOT NULL CHECK (media_type IN
        ('book', 'movie', 'music', 'podcast', 'video', 'magazine', 'audiobook')),
      description TEXT,
      cover_image_url TEXT,
      external_link TEXT,
      is_user_created BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function createLibraryEntriesTable() {
  await pool.query(`
    CREATE TABLE library_entries (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_id INT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN
        ('planned', 'in_progress', 'completed', 'archived')),
      rating INT CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
      personal_notes TEXT,
      date_acquired DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, media_id)
    );
  `);
}

async function createTagsTable() {
  await pool.query(`
    CREATE TABLE tags (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(50) NOT NULL,
      color VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, name)
    );
  `);
}

async function createLibraryEntryTagsTable() {
  await pool.query(`
    CREATE TABLE library_entry_tags (
      library_entry_id INT REFERENCES library_entries(id) ON DELETE CASCADE,
      tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
      position INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (library_entry_id, tag_id)
    );
  `);
}

async function seedUsersTable() {
  const raw = await readFile(path.join(__dirname, 'data', 'users.json'), 'utf8');
  const users = JSON.parse(raw);

  for (const user of users) {
    await pool.query(
      `INSERT INTO users (githubid, username, avatarurl, accesstoken, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.githubid, user.username, user.avatarurl, user.accesstoken, user.role]
    );
  }
}

async function seedMediaTable() {
  const raw = await readFile(path.join(__dirname, 'data', 'media.json'), 'utf8');
  const media = JSON.parse(raw);

  for (const item of media) {
    await pool.query(
      `INSERT INTO media (title, creator, media_type, description, cover_image_url, external_link)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [item.title, item.creator, item.media_type, item.description, item.cover_image_url, item.external_link]
    );
  }
}

async function resetDatabase() {
  await dropAllTables();
  await createUsersTable();
  await createUserProfilesTable();
  await createMediaTable();
  await createLibraryEntriesTable();
  await createTagsTable();
  await createLibraryEntryTagsTable();
  await seedUsersTable();
  await seedMediaTable();
  console.log('Database reset complete.');
  await pool.end();
}

resetDatabase().catch((error) => {
  console.error('Database reset failed:', error);
  process.exit(1);
});
