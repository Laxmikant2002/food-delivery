import express from 'express';
import { RestaurantController } from '../controllers';

const router = express.Router();
const restaurantController = new RestaurantController();

export const setRoutes = () => {
    router.get('/restaurants', restaurantController.getAllRestaurants.bind(restaurantController));
    router.get('/restaurants/:id', restaurantController.getRestaurantById.bind(restaurantController));
    router.post('/restaurants', restaurantController.createRestaurant.bind(restaurantController));
    router.put('/restaurants/:id', restaurantController.updateRestaurant.bind(restaurantController));
    router.delete('/restaurants/:id', restaurantController.deleteRestaurant.bind(restaurantController));

    return router;
};