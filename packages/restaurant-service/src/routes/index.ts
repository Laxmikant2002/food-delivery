import express from 'express';
import { authenticate } from '../middleware/auth';
import RestaurantController from '../controllers';

const router = express.Router();
const restaurantController = new RestaurantController();

// Public routes
router.get('/restaurants', restaurantController.getAllRestaurants.bind(restaurantController));
router.get('/restaurants/:id', restaurantController.getRestaurant.bind(restaurantController));

// Protected routes
router.put('/restaurants/:id', authenticate, restaurantController.updateRestaurant.bind(restaurantController));
router.put('/orders/:id/accept', authenticate, restaurantController.acceptOrder.bind(restaurantController));
router.put('/orders/:id/assign-agent', authenticate, restaurantController.assignDeliveryAgent.bind(restaurantController));

export default router;