import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { context } from './middleware/auth';
const app = express();
const port = process.env.PORT || 4002;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app: app as any });

  app.listen(port, () => {
    console.log(`🚀 Delivery Agent service ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});

export { app };