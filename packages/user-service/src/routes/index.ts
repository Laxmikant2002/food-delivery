import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate } from '../middleware/auth';

const router = Router();
const userController = new UserController();

export function setRoutes(app: Router) {
    // Public routes
    router.get('/restaurants', userController.getAvailableRestaurants.bind(userController));
    
    // Protected routes - require authentication
    router.use(authenticate);
    
    // Order routes
    router.get('/orders', userController.getOrders.bind(userController));
    router.post('/orders', userController.placeOrder.bind(userController));
    
    // Rating routes
    router.post('/ratings', userController.submitRating.bind(userController));

    // Mount routes at root level
    app.use('/', router);
}