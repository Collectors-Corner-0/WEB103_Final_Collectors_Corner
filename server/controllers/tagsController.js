import pool from '../config/database.js';

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateName(name, errors) {
  if (name !== undefined) {
    if (!name || !name.trim()) {
      errors.name = 'name is required.';
    } else if (name.trim().length > 50) {
      errors.name = 'name must be 50 characters or fewer.';
    }
  }
}

function validateColor(color, errors) {
  if (color !== undefined && color !== null && color.length > 20) {
    errors.color = 'color must be 20 characters or fewer.';
  }
}

const tagsController = {
  async getTagsByUser(req, res) {
    try {
      const userId = parseId(req.params.userId);
      if (userId === null) {
        return res.status(400).json({ error: 'userId must be a positive integer.' });
      }

      const result = await pool.query(
        'SELECT * FROM tags WHERE user_id = $1 ORDER BY name',
        [userId]
      );
      return res.json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async createTag(req, res) {
    try {
      const { name, color = null } = req.body;
      const userId = req.user.id;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'name is required.' });
      }
      if (name.trim().length > 50) {
        return res.status(400).json({ error: 'name must be 50 characters or fewer.' });
      }
      const errors = {};
      validateColor(color, errors);
      if (errors.color) return res.status(400).json({ error: errors.color });

      const result = await pool.query(
        'INSERT INTO tags (user_id, name, color) VALUES ($1, $2, $3) RETURNING *',
        [userId, name.trim(), color]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You already have a tag with that name.' });
      }
      if (error.code === '23503') {
        return res.status(400).json({ error: 'user_id does not reference an existing user.' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async updateTag(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const existing = await pool.query('SELECT * FROM tags WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: 'Tag not found.' });
      }
      if (existing.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only modify your own tags.' });
      }

      const { name, color } = req.body;
      const errors = {};
      validateName(name, errors);
      validateColor(color, errors);
      if (errors.name) return res.status(400).json({ error: errors.name });
      if (errors.color) return res.status(400).json({ error: errors.color });

      const current = existing.rows[0];
      const result = await pool.query(
        'UPDATE tags SET name = $1, color = $2 WHERE id = $3 RETURNING *',
        [
          name !== undefined ? name.trim() : current.name,
          color !== undefined ? color : current.color,
          id,
        ]
      );
      return res.json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You already have a tag with that name.' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async deleteTag(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const existing = await pool.query('SELECT * FROM tags WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: 'Tag not found.' });
      }
      if (existing.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only modify your own tags.' });
      }

      const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id]);
      return res.json({ id: result.rows[0].id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default tagsController;
