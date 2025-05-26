import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { PrismaClient } from '@prisma/client';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4001;

interface Context {
  prisma: PrismaClient;
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (_: ExpressContext): Promise<Context> => {
    // Add authentication logic here
    return { prisma };
  },
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app: app as any });

  app.listen(port, () => {
    console.log(`🚀 Restaurant service ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});