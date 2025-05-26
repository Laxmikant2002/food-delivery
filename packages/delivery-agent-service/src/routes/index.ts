import { Router } from 'express';
import { DeliveryAgentController } from '../controllers';

const router = Router();
const deliveryAgentController = new DeliveryAgentController();

router.get('/delivery-agents', deliveryAgentController.getAll);
router.get('/delivery-agents/:id', deliveryAgentController.getById);
router.post('/delivery-agents', deliveryAgentController.create);
router.put('/delivery-agents/:id', deliveryAgentController.update);
router.delete('/delivery-agents/:id', deliveryAgentController.delete);

export default router;