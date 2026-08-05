import pool from '../config/database.js';

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
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
           collections.id, collections.user_id, collections.name, collections.position,
           collections.created_at,
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
        `INSERT INTO collections (user_id, name, position)
         VALUES ($1, $2, $3)
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
};

export default collectionsController;
export { nextCollectionName };
