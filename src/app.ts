import express from 'express';

import database from './database/knex.js';
import errorHandler from './middlewares/error-handler.js';
import authRoutes from './routes/auth.routes.js';
import trainingRoutes from './routes/training.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import teamRoutes from './routes/team.routes.js';
import userRoutes from './routes/user.routes.js';
import corsMiddleware from './config/cors.js';

const app = express();

app.use(corsMiddleware);
app.use(express.json());

/**
 * Health check
 */
app.get('/health', async (_req, res) => {
  try {
    await database.raw('SELECT 1');

    return res.status(200).json({
      status: 'ok',
      service: 'SkillNovaGroup T&D API',
      database: 'connected',
    });
  } catch (error) {
    console.error(error);

    return res.status(503).json({
      status: 'error',
      service: 'SkillNovaGroup T&D API',
      database: 'disconnected',
    });
  }
});

/**
 * Routes
 */
app.use('/auth', authRoutes);
app.use('/trainings', trainingRoutes);
app.use('/notifications', notificationRoutes);
app.use('/teams', teamRoutes);
app.use('/users', userRoutes);
/**
 * Global error handler
 */
app.use(errorHandler);

export default app;