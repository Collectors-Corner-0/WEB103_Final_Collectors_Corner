import { Router } from 'express';
import libraryEntriesController from '../controllers/libraryEntriesController.js';

const router = Router();

// Must precede '/:userId' or Express would match 'entry' as a userId.
router.get('/entry/:id', libraryEntriesController.getEntryById);
router.get('/:userId', libraryEntriesController.getEntriesByUser);
router.post('/', libraryEntriesController.createEntry);
router.patch('/:id', libraryEntriesController.updateEntry);
router.delete('/:id', libraryEntriesController.deleteEntry);
router.post('/:entryId/tags/:tagId', libraryEntriesController.assignTag);
router.delete('/:entryId/tags/:tagId', libraryEntriesController.removeTag);

export default router;
