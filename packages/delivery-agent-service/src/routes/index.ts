import { Router } from 'express';
import { updateOrderStatus } from '../controllers';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected routes - require authentication
router.use(authenticate);

// PUT /orders/:id/status - Update delivery status
router.put('/orders/:id/status', updateOrderStatus);

export default router;