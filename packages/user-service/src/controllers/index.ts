import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController {
    // Get available restaurants
    async getAvailableRestaurants(_: Request, res: Response) {
        try {
            const now = new Date();
            const currentTime = `${now.getHours()}:${now.getMinutes()}`;

            const restaurants = await prisma.restaurant.findMany({
                where: {
                    isOnline: true,
                    AND: [
                        { availabilityStart: { lte: currentTime } },
                        { availabilityEnd: { gte: currentTime } }
                    ]
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
    async placeOrder(req: Request, res: Response) {
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
                    userId,
                    restaurantId,
                    status: OrderStatus.PENDING,
                    total,
                    deliveryAddress,
                    items: {
                        create: items.map(item => ({
                            quantity: item.quantity,
                            menuItemId: item.menuItemId
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

    // Submit a rating
    async submitRating(req: Request, res: Response) {
        try {
            const { orderId, rating, comment } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!orderId || rating === undefined) {
                return res.status(400).json({ error: 'Order ID and rating are required' });
            }

            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            if (order.userId !== userId) {
                return res.status(403).json({ error: 'Not authorized to rate this order' });
            }

            if (order.status !== OrderStatus.DELIVERED) {
                return res.status(400).json({ error: 'Can only rate delivered orders' });
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
                    rating,
                    comment
                }
            });

            return res.status(201).json(newRating);
        } catch (error) {
            console.error('Error submitting rating:', error);
            return res.status(500).json({ error: 'Failed to submit rating' });
        }
    }
}