import { AuthenticationError } from 'apollo-server-express';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Context {
  req: Request;
  user?: any;
  prisma: PrismaClient;
}

export const getUser = async (token: string): Promise<any | null> => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { restaurantId: string };
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: decoded.restaurantId }
    });
    return restaurant ? { ...restaurant, restaurantId: restaurant.id } : null;
  } catch (error) {
    return null;
  }
};

export const context = async ({ req }: { req: Request }): Promise<Context> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  const user = token ? await getUser(token) : undefined;
  
  return { req, user, prisma };
};

export const authDirective = {
  auth: async (next: any, _: any, __: any, context: Context) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in as a restaurant');
    }
    return next();
  },
}; 