import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from './middleware/auth';
import { PrismaClient } from '@prisma/client';
import { OrderStatus } from '@prisma/client';

export const resolvers = {
  Query: {
    restaurant: async (_: any, { id }: { id: string }, { prisma, user }: Context) => {
      try {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id },
          include: {
            menuItems: true,
            orders: {
              include: {
                orderItems: {
                  include: { menuItem: true }
                }
              }
            }
          }
        });

        if (!restaurant) {
          throw new UserInputError('Restaurant not found');
        }

        return restaurant;
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        throw new Error('Failed to fetch restaurant details');
      }
    },

    restaurantOrders: async (_: any, { status }: { status?: OrderStatus }, { prisma, user }: Context) => {
      try {
        return await prisma.order.findMany({
          where: {
            restaurantId: user.restaurantId,
            ...(status && { status })
          },
          include: {
            orderItems: {
              include: { menuItem: true }
            },
            deliveryAgent: true
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
      }
    },

    menuItems: async (_: any, __: any, { prisma, user }: Context) => {
      try {
        return await prisma.menuItem.findMany({
          where: { restaurantId: user.restaurantId }
        });
      } catch (error) {
        console.error('Error fetching menu items:', error);
        throw new Error('Failed to fetch menu items');
      }
    },

    pendingOrders: async (_: any, __: any, { prisma, user }: Context) => {
      try {
        return await prisma.order.findMany({
          where: {
            restaurantId: user.restaurantId,
            status: OrderStatus.PENDING
          },
          include: {
            orderItems: {
              include: { menuItem: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (error) {
        console.error('Error fetching pending orders:', error);
        throw new Error('Failed to fetch pending orders');
      }
    }
  },

  Mutation: {
    updateRestaurant: async (_: any, { input }: { input: any }, { prisma, user }: Context) => {
      try {
        return await prisma.restaurant.update({
          where: { id: user.restaurantId },
          data: input,
          include: { menuItems: true }
        });
      } catch (error) {
        console.error('Error updating restaurant:', error);
        throw new Error('Failed to update restaurant');
      }
    },

    createMenuItem: async (_: any, { input }: { input: any }, { prisma, user }: Context) => {
      try {
        return await prisma.menuItem.create({
          data: {
            ...input,
            restaurantId: user.restaurantId
          }
        });
      } catch (error) {
        console.error('Error creating menu item:', error);
        throw new Error('Failed to create menu item');
      }
    },

    updateMenuItem: async (_: any, { id, input }: { id: string; input: any }, { prisma, user }: Context) => {
      try {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id }
        });

        if (!menuItem) {
          throw new UserInputError('Menu item not found');
        }

        if (menuItem.restaurantId !== user.restaurantId) {
          throw new AuthenticationError('Not authorized to update this menu item');
        }

        return await prisma.menuItem.update({
          where: { id },
          data: input
        });
      } catch (error) {
        console.error('Error updating menu item:', error);
        throw new Error('Failed to update menu item');
      }
    },

    deleteMenuItem: async (_: any, { id }: { id: string }, { prisma, user }: Context) => {
      try {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id }
        });

        if (!menuItem) {
          throw new UserInputError('Menu item not found');
        }

        if (menuItem.restaurantId !== user.restaurantId) {
          throw new AuthenticationError('Not authorized to delete this menu item');
        }

        await prisma.menuItem.delete({ where: { id } });
        return true;
      } catch (error) {
        console.error('Error deleting menu item:', error);
        throw new Error('Failed to delete menu item');
      }
    },

    acceptOrder: async (_: any, { orderId }: { orderId: string }, { prisma, user }: Context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!order) {
          throw new UserInputError('Order not found');
        }

        if (order.restaurantId !== user.restaurantId) {
          throw new AuthenticationError('Not authorized to accept this order');
        }

        if (order.status !== OrderStatus.PENDING) {
          throw new UserInputError('Order is not in pending status');
        }

        // Find available delivery agent
        const availableAgent = await prisma.deliveryAgent.findFirst({
          where: { isAvailable: true }
        });

        if (!availableAgent) {
          throw new Error('No delivery agents available');
        }

        // Update order status and assign delivery agent
        return await prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.ACCEPTED,
            deliveryAgentId: availableAgent.id
          },
          include: {
            orderItems: {
              include: { menuItem: true }
            },
            deliveryAgent: true
          }
        });
      } catch (error) {
        console.error('Error accepting order:', error);
        throw new Error('Failed to accept order');
      }
    },

    rejectOrder: async (_: any, { orderId, reason }: { orderId: string; reason: string }, { prisma, user }: Context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!order) {
          throw new UserInputError('Order not found');
        }

        if (order.restaurantId !== user.restaurantId) {
          throw new AuthenticationError('Not authorized to reject this order');
        }

        if (order.status !== OrderStatus.PENDING) {
          throw new UserInputError('Order is not in pending status');
        }

        return await prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.REJECTED,
            rejectionReason: reason
          },
          include: {
            orderItems: {
              include: { menuItem: true }
            }
          }
        });
      } catch (error) {
        console.error('Error rejecting order:', error);
        throw new Error('Failed to reject order');
      }
    }
  }
}; 