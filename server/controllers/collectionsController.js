import pool from '../config/database.js';

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const MAX_DATA_URI_LENGTH = 2_800_000; // ~2MB decoded, after base64's ~1.33x inflation

function isValidAvatarUrl(value) {
  if (/^https?:\/\//.test(value)) return true;
  if (/^data:image\/(jpeg|png);base64,/.test(value)) return value.length <= MAX_DATA_URI_LENGTH;
  return false;
}

async function nextCollectionName(userId, client = pool) {
  const position = await client.query(
    'SELECT COALESCE(MAX(position), 0) + 1 AS position FROM collections WHERE user_id = $1',
    [userId]
  );
  const nextPosition = position.rows[0].position;

  const user = await client.query('SELECT username FROM users WHERE id = $1', [userId]);
  const name =
    nextPosition === 1
      ? `${user.rows[0].username}'s Collection`
      : `${user.rows[0].username}'s Collection ${nextPosition}`;

  return { name, position: nextPosition };
}

const collectionsController = {
  async getCollectionsByUser(req, res) {
    try {
      const userId = parseId(req.params.userId);
      if (userId === null) {
        return res.status(400).json({ error: 'userId must be a positive integer.' });
      }

      const result = await pool.query(
        `SELECT
           collections.id, collections.user_id, collections.name, collections.avatar_url,
           collections.position, collections.created_at,
           COUNT(library_entries.id)::int AS item_count
         FROM collections
         LEFT JOIN library_entries ON library_entries.collection_id = collections.id
         WHERE collections.user_id = $1
         GROUP BY collections.id
         ORDER BY collections.position`,
        [userId]
      );
      return res.json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async createCollection(req, res) {
    try {
      const userId = req.user.id;
      const { name } = req.body;

      let finalName = typeof name === 'string' ? name.trim() : '';
      let finalPosition;

      if (finalName) {
        const position = await pool.query(
          'SELECT COALESCE(MAX(position), 0) + 1 AS position FROM collections WHERE user_id = $1',
          [userId]
        );
        finalPosition = position.rows[0].position;
      } else {
        const generated = await nextCollectionName(userId);
        finalName = generated.name;
        finalPosition = generated.position;
      }

      const result = await pool.query(
        `INSERT INTO collections (user_id, name, avatar_url, position)
         VALUES ($1, $2, (SELECT avatarurl FROM users WHERE id = $1), $3)
         RETURNING *`,
        [userId, finalName, finalPosition]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A collection already exists at that position.' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async updateCollection(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const existing = await pool.query('SELECT * FROM collections WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: 'Collection not found.' });
      }
      if (existing.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only edit your own collections.' });
      }

      const { name, avatar_url } = req.body;

      let finalName = existing.rows[0].name;
      if (name !== undefined) {
        finalName = typeof name === 'string' ? name.trim() : '';
        if (!finalName) {
          return res.status(400).json({ error: 'name cannot be blank.' });
        }
      }

      let finalAvatarUrl = existing.rows[0].avatar_url;
      if (avatar_url !== undefined) {
        const trimmed = typeof avatar_url === 'string' ? avatar_url.trim() : '';
        if (trimmed && !isValidAvatarUrl(trimmed)) {
          return res
            .status(400)
            .json({ error: 'avatar_url must be an http(s) URL or a JPG/PNG image under 2MB.' });
        }
        finalAvatarUrl = trimmed || null;
      }

      const result = await pool.query(
        `UPDATE collections SET name = $1, avatar_url = $2 WHERE id = $3 RETURNING *`,
        [finalName, finalAvatarUrl, id]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default collectionsController;
export { nextCollectionName };
