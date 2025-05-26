import { PrismaClient } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    restaurant: async (_, { id }) => {
      return prisma.restaurant.findUnique({
        where: { id },
        include: { menuItems: true, orders: true }
      });
    },
    restaurants: async () => {
      return prisma.restaurant.findMany({
        include: { menuItems: true }
      });
    },
    menuItem: async (_, { id }) => {
      return prisma.menuItem.findUnique({
        where: { id },
        include: { restaurant: true }
      });
    },
    menuItems: async (_, { restaurantId }) => {
      return prisma.menuItem.findMany({
        where: { restaurantId },
        include: { restaurant: true }
      });
    },
    order: async (_, { id }) => {
      return prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          restaurant: true
        }
      });
    },
    restaurantOrders: async (_, { restaurantId }) => {
      return prisma.order.findMany({
        where: { restaurantId },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          restaurant: true
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    pendingOrders: async () => {
      return prisma.order.findMany({
        where: { status: 'PENDING' },
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });
    }
  },

  Mutation: {
    updateRestaurant: async (_, { input }, { restaurant }) => {
      if (!restaurant) throw new AuthenticationError('Not authenticated');

      return prisma.restaurant.update({
        where: { id: restaurant.id },
        data: input
      });
    },

    createMenuItem: async (_, { input }) => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: input.restaurantId }
      });

      if (!restaurant) {
        throw new UserInputError('Restaurant not found');
      }

      return prisma.menuItem.create({
        data: input,
        include: { restaurant: true }
      });
    },

    updateMenuItem: async (_, { id, input }) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id }
      });

      if (!menuItem) {
        throw new UserInputError('Menu item not found');
      }

      return prisma.menuItem.update({
        where: { id },
        data: input,
        include: { restaurant: true }
      });
    },

    deleteMenuItem: async (_, { id }) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id }
      });

      if (!menuItem) {
        throw new UserInputError('Menu item not found');
      }

      return prisma.menuItem.delete({
        where: { id },
        include: { restaurant: true }
      });
    },

    acceptOrder: async (_, { orderId }, { restaurant }) => {
      if (!restaurant) throw new AuthenticationError('Not authenticated');

      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order || order.restaurantId !== restaurant.id) {
        throw new UserInputError('Order not found or not for this restaurant');
      }

      return prisma.order.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED' }
      });
    },

    rejectOrder: async (_, { orderId, reason }, { restaurant }) => {
      if (!restaurant) throw new AuthenticationError('Not authenticated');

      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order || order.restaurantId !== restaurant.id) {
        throw new UserInputError('Order not found or not for this restaurant');
      }

      return prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason
        }
      });
    },

    updateOrderStatus: async (_, { input }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId }
      });

      if (!order) {
        throw new UserInputError('Order not found');
      }

      return prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status,
          ...(input.rejectionReason && { rejectionReason: input.rejectionReason })
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
    },

    toggleRestaurantAvailability: async (_, { id }) => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id }
      });

      if (!restaurant) {
        throw new UserInputError('Restaurant not found');
      }

      return prisma.restaurant.update({
        where: { id },
        data: {
          isOnline: !restaurant.isOnline
        },
        include: { menuItems: true }
      });
    }
  }
}; 