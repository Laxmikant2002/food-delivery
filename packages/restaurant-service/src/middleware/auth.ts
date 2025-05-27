import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';

const prisma = new PrismaClient();

export interface Context {
  req: Request;
  user?: any;
  prisma: PrismaClient;
}

export const getUser = async (token: string): Promise<any | null> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { restaurantId: string };
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: decoded.restaurantId }
    });
    return restaurant ? { ...restaurant, restaurant_id: restaurant.id } : null;
  } catch (error) {
    return null;
  }
};

export const context = async ({ req }: { req: Request }): Promise<Context> => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const user = token ? await getUser(token) : undefined;
    return { req, user, prisma };
  } catch (error) {
    console.error('Context creation error:', error);
    return { req, prisma };
  }
};

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await getUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }    req.user = user;
    next();
    return;
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};