import { Router } from 'express';
import { getCurrentSubscription, cancelSubscription } from '../controllers/subscriptionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/current', requireAuth, getCurrentSubscription);
router.post('/cancel', requireAuth, cancelSubscription);

export default router;
