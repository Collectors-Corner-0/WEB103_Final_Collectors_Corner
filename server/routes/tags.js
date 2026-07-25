import { Router } from 'express';
import tagsController from '../controllers/tagsController.js';

const router = Router();

router.get('/:userId', tagsController.getTagsByUser);
router.post('/', tagsController.createTag);
router.patch('/:id', tagsController.updateTag);
router.delete('/:id', tagsController.deleteTag);

export default router;
