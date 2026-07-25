import { Router } from 'express';
import tagsController from '../controllers/tagsController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.get('/:userId', tagsController.getTagsByUser);
router.post('/', requireAuth, tagsController.createTag);
router.patch('/:id', requireAuth, tagsController.updateTag);
router.delete('/:id', requireAuth, tagsController.deleteTag);

export default router;
