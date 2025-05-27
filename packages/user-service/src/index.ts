import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { setRoutes } from './routes';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(json());

// Apply routes
setRoutes(app);

// Start server
app.listen(port, () => {
  console.log(`🚀 User service running at http://localhost:${port}`);
});