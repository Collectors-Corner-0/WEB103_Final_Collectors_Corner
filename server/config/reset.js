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
      username VARCHAR(100) NOT NULL UNIQUE,
      avatarurl TEXT,
      accesstoken VARCHAR(500),
      role VARCHAR(20) NOT NULL DEFAULT 'collector' CHECK (role IN ('collector', 'creator')),
      created_at TIMESTAMP DEFAULT NOW()
    );
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

async function seedLibraryEntriesTable() {
  const raw = await readFile(path.join(__dirname, 'data', 'library_entries.json'), 'utf8');
  const entries = JSON.parse(raw);

  for (const entry of entries) {
    await pool.query(
      `INSERT INTO library_entries (user_id, media_id, status, rating, personal_notes, date_acquired)
       VALUES (
         (SELECT id FROM users WHERE username = $1),
         (SELECT id FROM media WHERE title = $2),
         $3, $4, $5, $6
       )`,
      [entry.username, entry.media_title, entry.status, entry.rating, entry.personal_notes, entry.date_acquired]
    );
  }
}

async function seedTagsTable() {
  const raw = await readFile(path.join(__dirname, 'data', 'tags.json'), 'utf8');
  const tags = JSON.parse(raw);

  for (const tag of tags) {
    await pool.query(
      `INSERT INTO tags (user_id, name, color)
       VALUES ((SELECT id FROM users WHERE username = $1), $2, $3)`,
      [tag.username, tag.name, tag.color]
    );
  }
}

async function seedLibraryEntryTagsTable() {
  const raw = await readFile(path.join(__dirname, 'data', 'library_entry_tags.json'), 'utf8');
  const assignments = JSON.parse(raw);

  const positionByEntry = new Map();

  for (const assignment of assignments) {
    const entryResult = await pool.query(
      `SELECT library_entries.id
       FROM library_entries
       JOIN users ON users.id = library_entries.user_id
       JOIN media ON media.id = library_entries.media_id
       WHERE users.username = $1 AND media.title = $2`,
      [assignment.username, assignment.media_title]
    );
    const entryId = entryResult.rows[0].id;
    const position = positionByEntry.get(entryId) ?? 0;
    positionByEntry.set(entryId, position + 1);

    await pool.query(
      `INSERT INTO library_entry_tags (library_entry_id, tag_id, position)
       VALUES (
         $1,
         (SELECT tags.id FROM tags JOIN users ON users.id = tags.user_id
          WHERE users.username = $2 AND tags.name = $3),
         $4
       )`,
      [entryId, assignment.username, assignment.tag_name, position]
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
  await seedLibraryEntriesTable();
  await seedTagsTable();
  await seedLibraryEntryTagsTable();
  console.log('Database reset complete.');
  await pool.end();
}

resetDatabase().catch((error) => {
  console.error('Database reset failed:', error);
  process.exit(1);
});
