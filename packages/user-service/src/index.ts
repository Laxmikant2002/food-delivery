import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { Context, UserType } from './types/context';
import type { Request } from 'express';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4001;

interface ApolloContext {
  req: Request;
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: ApolloContext): Promise<Context> => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let user: UserType | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string };
        const foundUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
          }
        });
        if (foundUser) {
          user = foundUser;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }

    return { prisma, user, req };
  },
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app: app as any });

  app.listen(port, () => {
    console.log(`🚀 User service ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});