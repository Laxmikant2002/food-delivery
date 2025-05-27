import { AuthenticationError } from 'apollo-server-express';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { Context } from '../types/context';
import { UserType } from '../types/context';

const prisma = new PrismaClient();

export const getUser = async (token: string): Promise<UserType | null> => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    return null;
  }
};

export const context = async ({ req }: { req: Request }): Promise<Context> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
    const user = token ? await getUser(token) : null;
  
  return { req, user, prisma };
};

export const authDirective = {
  auth: async (next: any, _: any, __: any, context: Context) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in');
    }
    return next();
  },
}; 