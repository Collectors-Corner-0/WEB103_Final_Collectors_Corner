import pool from '../config/database.js';

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const usersController = {
  async getAllUsers(req, res) {
    try {
      const result = await pool.query(
        'SELECT id, username, avatarurl, role, created_at FROM users ORDER BY id'
      );
      return res.json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getUserById(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const result = await pool.query(
        `SELECT
           users.id, users.username, users.avatarurl, users.role, users.created_at,
           user_profiles.display_name, user_profiles.bio, user_profiles.favorite_genres,
           COUNT(library_entries.id)::int AS library_entry_count
         FROM users
         LEFT JOIN user_profiles ON user_profiles.user_id = users.id
         LEFT JOIN collections ON collections.user_id = users.id
         LEFT JOIN library_entries ON library_entries.collection_id = collections.id
         WHERE users.id = $1
         GROUP BY users.id, user_profiles.user_id`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default usersController;
