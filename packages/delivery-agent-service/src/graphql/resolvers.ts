import { PrismaClient } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    me: async (_, __, { agent }) => {
      if (!agent) throw new AuthenticationError('Not authenticated');
      return agent;
    },
    currentOrder: async (_, __, { agent }) => {
      if (!agent) throw new AuthenticationError('Not authenticated');
      
      return prisma.order.findFirst({
        where: {
          deliveryAgentId: agent.id,
          status: 'IN_DELIVERY'
        }
      });
    },
    orderHistory: async (_, __, { agent }) => {
      if (!agent) throw new AuthenticationError('Not authenticated');

      return prisma.order.findMany({
        where: {
          deliveryAgentId: agent.id,
          status: 'DELIVERED'
        }
      });
    },
    availableOrders: async () => {
      return prisma.order.findMany({
        where: {
          status: 'ACCEPTED',
          deliveryAgentId: null
        }
      });
    },
    deliveryAgent: async (_, { id }) => {
      return prisma.deliveryAgent.findUnique({
        where: { id },
        include: { orders: true }
      });
    },
    deliveryAgents: async () => {
      return prisma.deliveryAgent.findMany({
        include: { orders: true }
      });
    },
    availableDeliveryAgents: async () => {
      return prisma.deliveryAgent.findMany({
        where: { isAvailable: true },
        include: { orders: true }
      });
    },
    deliveryAgentOrders: async (_, { deliveryAgentId }) => {
      return prisma.order.findMany({
        where: { deliveryAgentId },
        orderBy: { createdAt: 'desc' }
      });
    }
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const agent = await prisma.deliveryAgent.findUnique({ 
        where: { email } 
      });
      
      if (!agent) {
        throw new UserInputError('Invalid email or password');
      }

      const validPassword = await bcrypt.compare(password, agent.password);
      if (!validPassword) {
        throw new UserInputError('Invalid email or password');
      }

      const token = jwt.sign(
        { agentId: agent.id },
        process.env.JWT_SECRET || 'your-default-secret',
        { expiresIn: '24h' }
      );

      return {
        token,
        agent
      };
    },

    updateAvailability: async (_, { isAvailable }, { agent }) => {
      if (!agent) throw new AuthenticationError('Not authenticated');

      return prisma.deliveryAgent.update({
        where: { id: agent.id },
        data: { isAvailable }
      });
    },

    updateLocation: async (_, { input }, { agent }) => {
      if (!agent) throw new AuthenticationError('Not authenticated');

      return prisma.deliveryAgent.update({
        where: { id: agent.id },
        data: {
          currentLocation: {
            latitude: input.latitude,
            longitude: input.longitude,
            timestamp: new Date().toISOString()
          }
        }
      });
    },

    startDelivery: async (_, { orderId }, { agent }) => {
      if (!agent) throw new AuthenticationError('Not authenticated');

      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order || order.status !== 'ACCEPTED') {
        throw new UserInputError('Order not found or not available for delivery');
      }

      return prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'IN_DELIVERY',
          deliveryAgentId: agent.id
        }
      });
    },

    completeDelivery: async (_, { orderId }, { agent }) => {
      if (!agent) throw new AuthenticationError('Not authenticated');

      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order || order.deliveryAgentId !== agent.id) {
        throw new UserInputError('Order not found or not assigned to you');
      }

      return prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });
    },

    createDeliveryAgent: async (_, { input }) => {
      const existingAgent = await prisma.deliveryAgent.findUnique({
        where: { email: input.email }
      });

      if (existingAgent) {
        throw new UserInputError('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      
      return prisma.deliveryAgent.create({
        data: {
          ...input,
          password: hashedPassword,
          isAvailable: true
        },
        include: { orders: true }
      });
    },

    updateDeliveryAgent: async (_, { id, input }) => {
      const deliveryAgent = await prisma.deliveryAgent.findUnique({
        where: { id }
      });

      if (!deliveryAgent) {
        throw new UserInputError('Delivery agent not found');
      }

      return prisma.deliveryAgent.update({
        where: { id },
        data: input,
        include: { orders: true }
      });
    },

    assignOrder: async (_, { input }) => {
      const { orderId, deliveryAgentId } = input;

      const [order, deliveryAgent] = await Promise.all([
        prisma.order.findUnique({ where: { id: orderId } }),
        prisma.deliveryAgent.findUnique({ where: { id: deliveryAgentId } })
      ]);

      if (!order) {
        throw new UserInputError('Order not found');
      }

      if (!deliveryAgent) {
        throw new UserInputError('Delivery agent not found');
      }

      if (!deliveryAgent.isAvailable) {
        throw new UserInputError('Delivery agent is not available');
      }

      return prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryAgentId,
          status: 'IN_DELIVERY'
        }
      });
    },

    updateOrderStatus: async (_, { input }) => {
      const { orderId, status } = input;

      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new UserInputError('Order not found');
      }

      return prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
    },

    toggleDeliveryAgentAvailability: async (_, { id }) => {
      const deliveryAgent = await prisma.deliveryAgent.findUnique({
        where: { id }
      });

      if (!deliveryAgent) {
        throw new UserInputError('Delivery agent not found');
      }

      return prisma.deliveryAgent.update({
        where: { id },
        data: {
          isAvailable: !deliveryAgent.isAvailable
        },
        include: { orders: true }
      });
    },

    createOrder: async (_, { input }) => {
      return prisma.order.create({
        data: {
          pickupAddress: input.pickupAddress,
          deliveryAddress: input.deliveryAddress,
          status: input.status || 'PENDING'
        }
      });
    }
  }
};