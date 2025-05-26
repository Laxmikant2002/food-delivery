import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from './middleware/auth';
import { PrismaClient } from '@prisma/client';
import { OrderStatus } from '@prisma/client';

export const resolvers = {
  Query: {
    me: (_: any, __: any, { user }: Context) => {
      return user;
    },

    currentOrder: async (_: any, __: any, { prisma, user }: Context) => {
      try {
        return await prisma.order.findFirst({
          where: {
            deliveryAgentId: user.id,
            status: OrderStatus.IN_DELIVERY
          },
          include: {
            restaurant: {
              include: { location: true }
            },
            orderItems: {
              include: { menuItem: true }
            },
            deliveryLocation: true
          }
        });
      } catch (error) {
        console.error('Error fetching current order:', error);
        throw new Error('Failed to fetch current order');
      }
    },

    orderHistory: async (_: any, __: any, { prisma, user }: Context) => {
      try {
        return await prisma.order.findMany({
          where: {
            deliveryAgentId: user.id,
            status: OrderStatus.DELIVERED
          },
          include: {
            restaurant: {
              include: { location: true }
            },
            orderItems: {
              include: { menuItem: true }
            },
            deliveryLocation: true
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (error) {
        console.error('Error fetching order history:', error);
        throw new Error('Failed to fetch order history');
      }
    },

    availableOrders: async (_: any, __: any, { prisma, user }: Context) => {
      try {
        if (!user.isAvailable) {
          return [];
        }

        return await prisma.order.findMany({
          where: {
            status: OrderStatus.ACCEPTED,
            deliveryAgentId: null
          },
          include: {
            restaurant: {
              include: { location: true }
            },
            orderItems: {
              include: { menuItem: true }
            },
            deliveryLocation: true
          }
        });
      } catch (error) {
        console.error('Error fetching available orders:', error);
        throw new Error('Failed to fetch available orders');
      }
    }
  },

  Mutation: {
    updateAvailability: async (_: any, { isAvailable }: { isAvailable: boolean }, { prisma, user }: Context) => {
      try {
        // If becoming unavailable, check if there's an ongoing delivery
        if (!isAvailable) {
          const ongoingDelivery = await prisma.order.findFirst({
            where: {
              deliveryAgentId: user.id,
              status: OrderStatus.IN_DELIVERY
            }
          });

          if (ongoingDelivery) {
            throw new UserInputError('Cannot become unavailable while having an ongoing delivery');
          }
        }

        return await prisma.deliveryAgent.update({
          where: { id: user.id },
          data: { isAvailable }
        });
      } catch (error) {
        console.error('Error updating availability:', error);
        throw new Error('Failed to update availability');
      }
    },

    updateLocation: async (_: any, { input }: { input: { latitude: number; longitude: number } }, { prisma, user }: Context) => {
      try {
        return await prisma.deliveryAgent.update({
          where: { id: user.id },
          data: {
            currentLocation: {
              upsert: {
                create: input,
                update: input
              }
            }
          }
        });
      } catch (error) {
        console.error('Error updating location:', error);
        throw new Error('Failed to update location');
      }
    },

    startDelivery: async (_: any, { orderId }: { orderId: string }, { prisma, user }: Context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!order) {
          throw new UserInputError('Order not found');
        }

        if (order.deliveryAgentId !== user.id) {
          throw new AuthenticationError('Not authorized to deliver this order');
        }

        if (order.status !== OrderStatus.ACCEPTED) {
          throw new UserInputError('Order is not ready for delivery');
        }

        // Check if agent has any other ongoing deliveries
        const ongoingDelivery = await prisma.order.findFirst({
          where: {
            deliveryAgentId: user.id,
            status: OrderStatus.IN_DELIVERY
          }
        });

        if (ongoingDelivery) {
          throw new UserInputError('Cannot start new delivery while having an ongoing one');
        }

        return await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.IN_DELIVERY },
          include: {
            restaurant: {
              include: { location: true }
            },
            orderItems: {
              include: { menuItem: true }
            },
            deliveryLocation: true
          }
        });
      } catch (error) {
        console.error('Error starting delivery:', error);
        throw new Error('Failed to start delivery');
      }
    },

    completeDelivery: async (_: any, { orderId }: { orderId: string }, { prisma, user }: Context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!order) {
          throw new UserInputError('Order not found');
        }

        if (order.deliveryAgentId !== user.id) {
          throw new AuthenticationError('Not authorized to complete this delivery');
        }

        if (order.status !== OrderStatus.IN_DELIVERY) {
          throw new UserInputError('Order is not in delivery');
        }

        return await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.DELIVERED },
          include: {
            restaurant: {
              include: { location: true }
            },
            orderItems: {
              include: { menuItem: true }
            },
            deliveryLocation: true
          }
        });
      } catch (error) {
        console.error('Error completing delivery:', error);
        throw new Error('Failed to complete delivery');
      }
    }
  }
}; 