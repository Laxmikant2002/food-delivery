import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { setRoutes } from './routes';
import { context } from './middleware/auth';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(json());
app.use(async (req: any, _res, next) => {
  const ctx = await context({ req });
  req.user = ctx.user;
  next();
});

// Apply routes
setRoutes(app);

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 User service running at http://localhost:${port}`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
});