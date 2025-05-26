import { PrismaClient } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return user;
    },
    availableRestaurants: async () => {
      return prisma.restaurant.findMany({
        where: { isOnline: true },
        include: { menuItems: true }
      });
    },
    restaurant: async (_, { id }) => {
      return prisma.restaurant.findUnique({
        where: { id },
        include: { menuItems: true }
      });
    },
    order: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const order = await prisma.order.findUnique({
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

      if (!order || order.userId !== user.id) {
        throw new UserInputError('Order not found');
      }

      return order;
    },
    myOrders: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      return prisma.order.findMany({
        where: { userId: user.id },
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
    }
  },

  Mutation: {
    signUp: async (_, { input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email }
      });

      if (existingUser) {
        throw new UserInputError('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name
        }
      });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' }
      );

      return {
        token,
        user
      };
    },

    signIn: async (_, { input }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email }
      });

      if (!user) {
        throw new UserInputError('Invalid email or password');
      }

      const validPassword = await bcrypt.compare(input.password, user.password);

      if (!validPassword) {
        throw new UserInputError('Invalid email or password');
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' }
      );

      return {
        token,
        user
      };
    },

    placeOrder: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: input.restaurantId }
      });

      if (!restaurant || !restaurant.isOnline) {
        throw new UserInputError('Restaurant not available');
      }

      const menuItems = await prisma.menuItem.findMany({
        where: {
          id: {
            in: input.items.map(item => item.menuItemId)
          }
        }
      });

      if (menuItems.length !== input.items.length) {
        throw new UserInputError('Some menu items not found');
      }

      const total = input.items.reduce((sum, item) => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        return sum + (menuItem?.price || 0) * item.quantity;
      }, 0);

      return prisma.order.create({
        data: {
          userId: user.id,
          restaurantId: input.restaurantId,
          status: 'PENDING',
          total,
          deliveryAddress: input.deliveryAddress,
          items: {
            create: input.items.map(item => ({
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
    },

    submitRating: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const order = await prisma.order.findUnique({
        where: { id: input.orderId }
      });

      if (!order || order.userId !== user.id) {
        throw new UserInputError('Order not found');
      }

      if (order.status !== 'DELIVERED') {
        throw new UserInputError('Can only rate delivered orders');
      }

      const existingRating = await prisma.rating.findUnique({
        where: { orderId: input.orderId }
      });

      if (existingRating) {
        throw new UserInputError('Order already rated');
      }

      return prisma.rating.create({
        data: {
          rating: input.rating,
          comment: input.comment,
          userId: user.id,
          orderId: input.orderId
        }
      });
    }
  }
}; 