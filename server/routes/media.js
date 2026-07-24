import { Router } from 'express';
import mediaController from '../controllers/mediaController.js';

const router = Router();

router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.post('/', mediaController.createMedia);
router.patch('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);

export default router;
