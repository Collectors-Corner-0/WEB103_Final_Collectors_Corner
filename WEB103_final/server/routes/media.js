import { Router } from 'express';
import { query } from '../db.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();
const validTypes = new Set(['book', 'movie', 'music', 'tv', 'game', 'other']);

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, type, creator = null, description = null, image_url = null, release_year = null } = req.body;

    if (!title?.trim() || !type?.trim()) {
      return res.status(400).json({ error: 'title and type are required.' });
    }

    const normalizedType = type.trim().toLowerCase();
    if (!validTypes.has(normalizedType)) {
      return res.status(400).json({ error: 'Invalid media type.' });
    }

    const result = await query(
      `INSERT INTO media (title, type, creator, description, image_url, release_year, is_user_generated, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
       RETURNING *`,
      [title.trim(), normalizedType, creator, description, image_url, release_year, req.session.userId]
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const search = (req.query.q ?? '').toString().trim();
    if (!search) {
      return res.status(400).json({ error: 'Query parameter q is required.' });
    }

    const result = await query(
      `SELECT *
       FROM media
       WHERE is_user_generated = TRUE
         AND (title ILIKE $1 OR COALESCE(description, '') ILIKE $1)
       ORDER BY created_at DESC
       LIMIT 50`,
      [`%${search}%`]
    );

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
});

export default router;
