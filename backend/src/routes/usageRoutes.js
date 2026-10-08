import { Router } from 'express';
import { getUsage, trackUsage } from '../controllers/usageController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/summary', requireAuth, getUsage);
router.post('/track', requireAuth, trackUsage);

export default router;
