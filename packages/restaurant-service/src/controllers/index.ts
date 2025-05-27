import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';

const prisma = new PrismaClient();

export class RestaurantController {
    // Update restaurant details (menu, pricing, availability)
    async updateRestaurant(req: AuthenticatedRequest, res: Response) {
        try {
            const restaurantId = req.params.id;
            const { name, isOnline, menuItems } = req.body;

            // Check if user is authorized for this restaurant
            if (!req.user || req.user.restaurantId !== restaurantId) {
                return res.status(403).json({ error: 'Not authorized to modify this restaurant' });
            }
            
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: restaurantId }
            });

            if (!restaurant) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }

            // Update restaurant details
            const updatedRestaurant = await prisma.restaurant.update({
                where: { id: restaurantId },
                data: {
                    name: name,
                    isOnline: isOnline,
                },
                include: {
                    menuItems: true
                }
            });

            // Update menu items if provided
            if (menuItems && Array.isArray(menuItems)) {
                for (const item of menuItems) {
                    if (item.id) {
                        // Update existing menu item
                        await prisma.menuItem.update({
                            where: { id: item.id },
                            data: {
                                name: item.name,
                                description: item.description,
                                price: item.price
                            }
                        });
                    } else {
                        // Create new menu item
                        await prisma.menuItem.create({
                            data: {
                                ...item,
                                restaurantId
                            }
                        });
                    }
                }
            }

            return res.json(updatedRestaurant);
        } catch (error) {
            console.error('Error updating restaurant:', error);
            return res.status(500).json({ error: 'Failed to update restaurant' });
        }
    }

    // Accept an order
    async acceptOrder(req: AuthenticatedRequest, res: Response) {
        try {
            const orderId = req.params.id;
            
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { restaurant: true }
            });

            // Check if user is authorized for this restaurant's orders
            if (!req.user || !order || req.user.restaurantId !== order.restaurantId) {
                return res.status(403).json({ error: 'Not authorized to modify this order' });
            }

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            if (order.status !== OrderStatus.PENDING) {
                return res.status(400).json({ error: 'Order cannot be accepted - invalid status' });
            }

            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.ACCEPTED
                },
                include: {
                    restaurant: true,
                    items: {
                        include: {
                            menuItem: true
                        }
                    }
                }
            });

            return res.json(updatedOrder);
        } catch (error) {
            console.error('Error accepting order:', error);
            return res.status(500).json({ error: 'Failed to accept order' });
        }
    }

    // Assign delivery agent to order
    async assignDeliveryAgent(req: AuthenticatedRequest, res: Response) {
        try {
            const orderId = req.params.id;
            const { deliveryAgentId } = req.body;

            if (!deliveryAgentId) {
                return res.status(400).json({ error: 'Delivery agent ID is required' });
            }

            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { restaurant: true }
            });

            // Check if user is authorized for this restaurant's orders
            if (!req.user || !order || req.user.restaurantId !== order.restaurantId) {
                return res.status(403).json({ error: 'Not authorized to modify this order' });
            }

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            if (order.status !== OrderStatus.ACCEPTED) {
                return res.status(400).json({ error: 'Order must be accepted before assigning delivery agent' });
            }

            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    deliveryAgentId,
                    status: OrderStatus.IN_DELIVERY
                },
                include: {
                    restaurant: true,
                    items: {
                        include: {
                            menuItem: true
                        }
                    }
                }
            });

            return res.json(updatedOrder);
        } catch (error) {
            console.error('Error assigning delivery agent:', error);
            return res.status(500).json({ error: 'Failed to assign delivery agent' });
        }
    }

    // Get all restaurants
    async getAllRestaurants(_req: Request, res: Response) {
        try {
            const restaurants = await prisma.restaurant.findMany({
                include: {
                    menuItems: true
                }
            });
            return res.json(restaurants);
        } catch (error) {
            console.error('Error getting restaurants:', error);
            return res.status(500).json({ error: 'Failed to get restaurants' });
        }
    }

    // Get a single restaurant by ID
    async getRestaurant(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const restaurant = await prisma.restaurant.findUnique({
                where: { id },
                include: {
                    menuItems: true,
                    orders: {
                        include: {
                            items: {
                                include: {
                                    menuItem: true
                                }
                            }
                        }
                    }
                }
            });

            if (!restaurant) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }

            return res.json(restaurant);
        } catch (error) {
            console.error('Error getting restaurant:', error);
            return res.status(500).json({ error: 'Failed to get restaurant' });
        }
    }
}

export default RestaurantController;