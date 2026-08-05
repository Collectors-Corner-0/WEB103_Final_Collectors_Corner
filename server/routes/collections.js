import { Router } from 'express';
import collectionsController from '../controllers/collectionsController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.get('/:userId', collectionsController.getCollectionsByUser);
router.post('/', requireAuth, collectionsController.createCollection);
router.patch('/:id', requireAuth, collectionsController.updateCollection);

export default router;
