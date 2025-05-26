// GraphQL resolvers for User Service
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from './middleware/auth';
import { compare, sign } from 'bcryptjs';
import { OrderStatus } from '@prisma/client';

interface Context {
  prisma: PrismaClient;
  req?: any;
  user?: any;
}

const SALT_ROUNDS = 10;

export const resolvers = {
  Query: {
    users: async (_: any, __: any, { prisma }: Context) => {
      return prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true
        }
      });
    },
    
    user: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true
        }
      });
    },
    
    availableRestaurants: async (_: any, __: any, { prisma }: Context) => {
      try {
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes()}`;

        return await prisma.restaurant.findMany({
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
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw new Error('Failed to fetch available restaurants');
      }
    },
    
    restaurant: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      try {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id },
          include: { menuItems: true }
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
    
    userOrders: async (_: any, { userId }: { userId: string }, { prisma }: Context) => {
      return prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    },
    
    me: (_: any, __: any, context: Context) => {
      return context.user;
    },

    order: async (_: any, { id }: { id: string }, { prisma, user }: Context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id },
          include: {
            orderItems: {
              include: { menuItem: true }
            },
            restaurant: true,
            deliveryAgent: true
          }
        });

        if (!order) {
          throw new UserInputError('Order not found');
        }

        if (order.userId !== user!.id) {
          throw new AuthenticationError('Not authorized to view this order');
        }

        return order;
      } catch (error) {
        console.error('Error fetching order:', error);
        throw new Error('Failed to fetch order details');
      }
    },

    myOrders: async (_: any, __: any, { prisma, user }: Context) => {
      try {
        return await prisma.order.findMany({
          where: { userId: user!.id },
          include: {
            orderItems: {
              include: { menuItem: true }
            },
            restaurant: true,
            deliveryAgent: true
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
      }
    }
  },
  
  Mutation: {
    createUser: async (
      _: any,
      { email, password, name }: { email: string; password: string; name: string },
      { prisma }: Context
    ) => {
      const hashedPassword = await hash(password, 10);
      
      return prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });
    },
    
    updateUser: async (
      _: any, 
      { id, email, name }: { id: string; email?: string; name?: string },
      { prisma }: Context
    ) => {
      return prisma.user.update({
        where: { id },
        data: {
          ...(email && { email }),
          ...(name && { name })
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });
    },
    
    deleteUser: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      await prisma.user.delete({ where: { id } });
      return true;
    },
    
    placeOrder: async (_: any, { input }: { input: { restaurantId: string; orderItems: { menuItemId: string; quantity: number }[] } }, { prisma, user }: Context) => {
      try {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: input.restaurantId },
          include: { menuItems: true }
        });

        if (!restaurant) {
          throw new UserInputError('Restaurant not found');
        }

        if (!restaurant.isOnline) {
          throw new UserInputError('Restaurant is currently offline');
        }

        const menuItems = await prisma.menuItem.findMany({
          where: {
            id: { in: input.orderItems.map(item => item.menuItemId) }
          }
        });

        if (menuItems.length !== input.orderItems.length) {
          throw new UserInputError('One or more menu items not found');
        }

        const totalAmount = input.orderItems.reduce((total, item) => {
          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
          return total + (menuItem!.price * item.quantity);
        }, 0);

        return await prisma.order.create({
          data: {
            userId: user!.id,
            restaurantId: input.restaurantId,
            status: OrderStatus.PENDING,
            totalAmount,
            orderItems: {
              create: input.orderItems.map(item => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity
              }))
            }
          },
          include: {
            orderItems: {
              include: { menuItem: true }
            },
            restaurant: true
          }
        });
      } catch (error) {
        console.error('Error placing order:', error);
        throw new Error('Failed to place order');
      }
    },
    
    submitRating: async (_: any, { input }: { input: { orderId: string; restaurantRating: number; deliveryAgentRating?: number } }, { prisma, user }: Context) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: input.orderId }
        });

        if (!order) {
          throw new UserInputError('Order not found');
        }

        if (order.userId !== user!.id) {
          throw new AuthenticationError('Not authorized to rate this order');
        }

        if (order.status !== OrderStatus.DELIVERED) {
          throw new UserInputError('Can only rate delivered orders');
        }

        const existingRating = await prisma.rating.findFirst({
          where: { orderId: input.orderId }
        });

        if (existingRating) {
          throw new UserInputError('Order has already been rated');
        }

        return await prisma.rating.create({
          data: {
            orderId: input.orderId,
            userId: user!.id,
            restaurantRating: input.restaurantRating,
            deliveryAgentRating: input.deliveryAgentRating
          }
        });
      } catch (error) {
        console.error('Error submitting rating:', error);
        throw new Error('Failed to submit rating');
      }
    },

    signUp: async (_: any, { input }: { input: { email: string; password: string; name: string } }, { prisma }: Context) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: input.email }
        });

        if (existingUser) {
          throw new UserInputError('Email already in use');
        }

        const hashedPassword = await hash(input.password, SALT_ROUNDS);
        const user = await prisma.user.create({
          data: {
            email: input.email,
            password: hashedPassword,
            name: input.name
          }
        });

        const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        return { token, user };
      } catch (error) {
        console.error('Error during signup:', error);
        throw new Error('Failed to create account');
      }
    },

    signIn: async (_: any, { input }: { input: { email: string; password: string } }, { prisma }: Context) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: input.email }
        });

        if (!user) {
          throw new UserInputError('Invalid email or password');
        }

        const validPassword = await compare(input.password, user.password);
        if (!validPassword) {
          throw new UserInputError('Invalid email or password');
        }

        const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        return { token, user };
      } catch (error) {
        console.error('Error during signin:', error);
        throw new Error('Failed to sign in');
      }
    }
  },
};
