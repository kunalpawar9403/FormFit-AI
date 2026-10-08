import { Router } from 'express';
import { getPresets, createPreset, deletePreset } from '../controllers/presetController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getPresets);
router.post('/', requireAuth, createPreset);
router.delete('/:id', requireAuth, deletePreset);

export default router;
