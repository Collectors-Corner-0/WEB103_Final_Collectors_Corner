import { Router } from 'express';
import { query } from '../db.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { media_id, status = 'planned', rating = null, notes = null } = req.body;
    const parsedMediaId = Number.parseInt(media_id, 10);

    if (!Number.isInteger(parsedMediaId) || parsedMediaId <= 0) {
      return res.status(400).json({ error: 'media_id must be a valid integer.' });
    }

    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 10)) {
      return res.status(400).json({ error: 'rating must be between 1 and 10.' });
    }

    const mediaResult = await query('SELECT id FROM media WHERE id = $1', [parsedMediaId]);
    if (mediaResult.rowCount === 0) {
      return res.status(404).json({ error: 'Media not found.' });
    }

    const result = await query(
      `INSERT INTO library_entries (user_id, media_id, status, rating, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.session.userId, parsedMediaId, status, rating, notes]
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This media is already in your library.' });
    }
    return next(error);
  }
});

export default router;
