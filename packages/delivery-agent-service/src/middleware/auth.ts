import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';
import type { DeliveryAgentPayload } from '../types/express';

const prisma = new PrismaClient();

export interface Context {
  req: Request;
  user?: DeliveryAgentPayload;
  prisma: PrismaClient;
}

export const getUser = async (token: string): Promise<DeliveryAgentPayload | undefined> => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { agentId: string };
    
    const agents = await prisma.$queryRaw`
      SELECT id, email, name, "isOnline"
      FROM delivery_agents
      WHERE id = ${decoded.agentId}::uuid
      LIMIT 1;
    `;
    
    if (Array.isArray(agents) && agents.length > 0) {
      return agents[0] as DeliveryAgentPayload;
    }
    
    return undefined;
  } catch (error) {
    return undefined;
  }
};

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await getUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid agent credentials' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};