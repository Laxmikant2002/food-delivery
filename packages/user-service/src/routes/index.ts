import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();
const userController = new UserController();

export function setRoutes(app: Router) {
    app.use('/api/users', router);
    
    // User routes
    router.get('/', userController.getAllUsers.bind(userController));
    router.post('/', userController.createUser.bind(userController));
    router.get('/:id', userController.getUserById.bind(userController));
    router.put('/:id', userController.updateUser.bind(userController));
    router.delete('/:id', userController.deleteUser.bind(userController));
    
    // Profile routes
    app.put('/api/profile', userController.updateProfile.bind(userController));
    app.delete('/api/profile', userController.deleteAccount.bind(userController));
}