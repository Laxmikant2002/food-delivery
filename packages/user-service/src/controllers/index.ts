import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { prisma } from '../types/prisma';

export class UserController {
    // Get available restaurants
    async getAvailableRestaurants(_: AuthenticatedRequest, res: Response) {
        try {
            const now = new Date();
            // Create a date at midnight UTC
            const baseDate = new Date(Date.UTC(2000, 0, 1));
            // Set the time components from 'now'
            baseDate.setUTCHours(now.getHours());
            baseDate.setUTCMinutes(now.getMinutes());
            baseDate.setUTCSeconds(0);
            baseDate.setUTCMilliseconds(0);

            const restaurants = await prisma.restaurant.findMany({
                where: {
                    isOnline: true,
                    availabilityStart: { lte: baseDate },
                    availabilityEnd: { gte: baseDate }
                },
                include: {
                    menuItems: true
                }
            });
            return res.json(restaurants);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            return res.status(500).json({ error: 'Failed to fetch restaurants' });
        }
    }

    // Place a new order
    async placeOrder(req: AuthenticatedRequest, res: Response) {
        try {
            const { restaurantId, items, deliveryAddress } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!restaurantId || !items?.length || !deliveryAddress) {
                return res.status(400).json({ error: 'Restaurant ID, items, and delivery address are required' });
            }

            const restaurant = await prisma.restaurant.findUnique({
                where: { id: restaurantId },
                include: { menuItems: true }
            });

            if (!restaurant || !restaurant.isOnline) {
                return res.status(400).json({ error: 'Restaurant not available' });
            }

            const menuItems = await prisma.menuItem.findMany({
                where: {
                    id: {
                        in: items.map(item => item.menuItemId)
                    }
                }
            });

            if (menuItems.length !== items.length) {
                return res.status(400).json({ error: 'Some menu items not found' });
            }

            const total = items.reduce((sum, item) => {
                const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                return sum + (menuItem?.price || 0) * item.quantity;
            }, 0);

            const order = await prisma.order.create({
                data: {
                    user_id: userId,
                    restaurant_id: restaurantId,
                    status: "PENDING",
                    total,
                    delivery_address: deliveryAddress,
                    items: {
                        create: items.map(item => ({
                            quantity: item.quantity,
                            menuItem: {
                                connect: { id: item.menuItemId }
                            }
                        }))
                    }
                },
                include: {
                    items: {
                        include: {
                            menuItem: true
                        }
                    },
                    restaurant: true
                }
            });

            return res.status(201).json(order);
        } catch (error) {
            console.error('Error placing order:', error);
            return res.status(500).json({ error: 'Failed to place order' });
        }
    }

    // Get user orders
    async getOrders(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const orders = await prisma.order.findMany({
                where: { user_id: userId },
                include: {
                    items: {
                        include: {
                            menuItem: true
                        }
                    },
                    restaurant: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            return res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }

    // Submit a rating
    async submitRating(req: AuthenticatedRequest, res: Response) {
        try {
            const { orderId, restaurantRating, deliveryRating, comment } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!orderId || restaurantRating === undefined) {
                return res.status(400).json({ error: 'Order ID and restaurant rating are required' });
            }

            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            if (order.user_id !== userId) {
                return res.status(403).json({ error: 'Not authorized to rate this order' });
            }

            const existingRating = await prisma.rating.findFirst({
                where: { orderId }
            });

            if (existingRating) {
                return res.status(400).json({ error: 'Order has already been rated' });
            }

            const newRating = await prisma.rating.create({
                data: {
                    orderId,
                    userId,
                    restaurantId: order.restaurant_id,
                    restaurantRating,
                    deliveryRating: deliveryRating || null,
                    comment: comment || null
                }
            });

            return res.status(201).json(newRating);
        } catch (error) {
            console.error('Error submitting rating:', error);
            return res.status(500).json({ error: 'Failed to submit rating' });
        }
    }
}