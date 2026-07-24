import pool from '../config/database.js';

const STATUSES = ['planned', 'in_progress', 'completed', 'archived'];

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

const ENTRY_SELECT = `
  SELECT
    library_entries.id,
    library_entries.user_id,
    library_entries.media_id,
    library_entries.status,
    library_entries.rating,
    library_entries.personal_notes,
    library_entries.date_acquired,
    library_entries.created_at,
    media.title,
    media.creator,
    media.media_type,
    media.cover_image_url,
    media.external_link
  FROM library_entries
  JOIN media ON media.id = library_entries.media_id
`;

const libraryEntriesController = {
  async getEntriesByUser(req, res) {
    try {
      const userId = parseId(req.params.userId);
      if (userId === null) {
        return res.status(400).json({ error: 'userId must be a positive integer.' });
      }

      const result = await pool.query(
        `${ENTRY_SELECT} WHERE library_entries.user_id = $1 ORDER BY library_entries.id`,
        [userId]
      );
      return res.json(result.rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getEntryById(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const result = await pool.query(`${ENTRY_SELECT} WHERE library_entries.id = $1`, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Library entry not found.' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async createEntry(req, res) {
    try {
      const {
        user_id,
        media_id,
        status = 'planned',
        rating = null,
        personal_notes = null,
        date_acquired = null,
      } = req.body;

      const userId = parseId(user_id);
      const mediaId = parseId(media_id);

      if (userId === null || mediaId === null) {
        return res.status(400).json({ error: 'user_id and media_id are required and must be positive integers.' });
      }
      if (rating !== null && !isValidRating(rating)) {
        return res.status(400).json({ error: 'rating must be an integer from 1 to 5.' });
      }
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}.` });
      }

      const result = await pool.query(
        `INSERT INTO library_entries (user_id, media_id, status, rating, personal_notes, date_acquired)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, mediaId, status, rating, personal_notes, date_acquired]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'This media is already in that user’s library.' });
      }
      if (error.code === '23503') {
        return res.status(400).json({ error: 'user_id or media_id does not reference an existing row.' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async updateEntry(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const existing = await pool.query('SELECT * FROM library_entries WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: 'Library entry not found.' });
      }

      const { status, rating, personal_notes, date_acquired } = req.body;

      if (status !== undefined && !STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}.` });
      }
      if (rating !== undefined && rating !== null && !isValidRating(rating)) {
        return res.status(400).json({ error: 'rating must be an integer from 1 to 5.' });
      }

      const current = existing.rows[0];
      const result = await pool.query(
        `UPDATE library_entries
         SET status = $1, rating = $2, personal_notes = $3, date_acquired = $4
         WHERE id = $5
         RETURNING *`,
        [
          status !== undefined ? status : current.status,
          rating !== undefined ? rating : current.rating,
          personal_notes !== undefined ? personal_notes : current.personal_notes,
          date_acquired !== undefined ? date_acquired : current.date_acquired,
          id,
        ]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async deleteEntry(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const result = await pool.query('DELETE FROM library_entries WHERE id = $1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Library entry not found.' });
      }

      return res.json({ id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default libraryEntriesController;
