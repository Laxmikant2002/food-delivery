import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const port = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Delivery Agent service ready at http://localhost:${port}`);
});

export { app };