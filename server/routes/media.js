import { Router } from 'express';
import mediaController from '../controllers/mediaController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.post('/', requireAuth, mediaController.createMedia);
router.patch('/:id', requireAuth, mediaController.updateMedia);
router.delete('/:id', requireAuth, mediaController.deleteMedia);

export default router;
