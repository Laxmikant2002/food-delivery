import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Context } from '../types/context';
import { UserType } from '../types/context';

const prisma = new PrismaClient();

export const getUser = async (token: string): Promise<UserType | null> => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return null;
    }
    
    // Only return non-sensitive user data
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserType;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

export const authenticate = async (req: Request & { user?: UserType }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await getUser(token);
    
    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }
};

export const context = async ({ req }: { req: Request }): Promise<Context> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const user = token ? await getUser(token) : null;
  
  return { req, user, prisma };
};