import { Router } from 'express';
import collectionsController from '../controllers/collectionsController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.get('/:userId', collectionsController.getCollectionsByUser);
router.post('/', requireAuth, collectionsController.createCollection);

export default router;
