import { Router } from 'express';
import libraryEntriesController from '../controllers/libraryEntriesController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.get('/entry/:id', libraryEntriesController.getEntryById);
router.get('/collection/:collectionId', libraryEntriesController.getEntriesByCollection);
router.post('/', requireAuth, libraryEntriesController.createEntry);
router.patch('/:id', requireAuth, libraryEntriesController.updateEntry);
router.delete('/:id', requireAuth, libraryEntriesController.deleteEntry);
router.post('/:entryId/tags/:tagId', requireAuth, libraryEntriesController.assignTag);
router.delete('/:entryId/tags/:tagId', requireAuth, libraryEntriesController.removeTag);

export default router;
