import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();
const userController = new UserController();

export function setRoutes(app: Router) {
    // Restaurant routes
    router.get('/restaurants', userController.getAvailableRestaurants);
    
    // Order routes
    router.get('/orders', userController.getOrders);
    router.post('/orders', userController.placeOrder);
    
    // Rating routes
    router.post('/ratings', userController.submitRating);

    // Mount routes at root level
    app.use('/', router);
}