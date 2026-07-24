import pool from '../config/database.js';

const MEDIA_TYPES = ['book', 'movie', 'music', 'podcast', 'video', 'magazine', 'audiobook'];

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const mediaController = {
  async getAllMedia(req, res) {
    try {
      const { media_type, search } = req.query;
      const conditions = [];
      const params = [];

      if (media_type) {
        params.push(media_type);
        conditions.push(`media_type = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`title ILIKE $${params.length}`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await pool.query(`SELECT * FROM media ${where} ORDER BY id`, params);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async getMediaById(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const result = await pool.query('SELECT * FROM media WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Media not found.' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async createMedia(req, res) {
    try {
      const {
        title,
        creator = null,
        media_type,
        description = null,
        cover_image_url = null,
        external_link = null,
        is_user_created = false,
        created_by_user_id = null,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'title is required.' });
      }
      if (!MEDIA_TYPES.includes(media_type)) {
        return res.status(400).json({ error: `media_type must be one of: ${MEDIA_TYPES.join(', ')}.` });
      }

      const result = await pool.query(
        `INSERT INTO media
           (title, creator, media_type, description, cover_image_url, external_link, is_user_created, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [title.trim(), creator, media_type, description, cover_image_url, external_link, is_user_created, created_by_user_id]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({ error: 'created_by_user_id does not reference an existing user.' });
      }
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async updateMedia(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const existing = await pool.query('SELECT * FROM media WHERE id = $1', [id]);
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: 'Media not found.' });
      }

      const { title, creator, media_type, description, cover_image_url, external_link, is_user_created } = req.body;

      if (title !== undefined && !title.trim()) {
        return res.status(400).json({ error: 'title cannot be empty.' });
      }
      if (media_type !== undefined && !MEDIA_TYPES.includes(media_type)) {
        return res.status(400).json({ error: `media_type must be one of: ${MEDIA_TYPES.join(', ')}.` });
      }

      const current = existing.rows[0];
      const result = await pool.query(
        `UPDATE media
         SET title = $1, creator = $2, media_type = $3, description = $4,
             cover_image_url = $5, external_link = $6, is_user_created = $7
         WHERE id = $8
         RETURNING *`,
        [
          title !== undefined ? title.trim() : current.title,
          creator !== undefined ? creator : current.creator,
          media_type !== undefined ? media_type : current.media_type,
          description !== undefined ? description : current.description,
          cover_image_url !== undefined ? cover_image_url : current.cover_image_url,
          external_link !== undefined ? external_link : current.external_link,
          is_user_created !== undefined ? is_user_created : current.is_user_created,
          id,
        ]
      );

      return res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  async deleteMedia(req, res) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'id must be a positive integer.' });
      }

      const result = await pool.query('DELETE FROM media WHERE id = $1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Media not found.' });
      }

      return res.json({ id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default mediaController;
