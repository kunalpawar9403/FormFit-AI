import { Router } from 'express';
import { getPlans, createOrder, verifyPayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/plans', getPlans);
router.post('/create-order', requireAuth, createOrder);
router.post('/verify-payment', requireAuth, verifyPayment);

export default router;
