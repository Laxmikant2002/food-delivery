import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

// Define a basic user type that matches our Prisma schema
export interface UserType {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Context {
  prisma: PrismaClient;
  user?: UserType | null;
  req?: Request;
}

export interface AuthContext extends Context {
  user: UserType;  // User is required in authenticated context
}

// Helper type for resolvers
export type ResolverContext = {
  prisma: PrismaClient;
  req: Request;
  user?: UserType | null;
}; 