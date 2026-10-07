import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import authRoutes from './server/routes/authRoutes';
import pickupRoutes from './server/routes/pickupRoutes';
import centerRoutes from './server/routes/centerRoutes';
import analyticsRoutes from './server/routes/analyticsRoutes';
import rewardsRoutes from './server/routes/rewardsRoutes';
import { setupSockets } from './server/sockets';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  setupSockets(io);

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'EcoCollect Real-Time Platform',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/pickups', pickupRoutes);
  app.use('/api/centers', centerRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/rewards', rewardsRoutes);

  // API 404 handler for unknown api routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `The requested endpoint ${req.originalUrl} does not exist.`,
        details: [],
      },
    });
  });

  // Centralized Error Handling Middleware (Section 8 Requirement)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

    const statusCode = err.status || err.statusCode || 500;
    const errorCode = err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');
    const message = err.message || 'An unexpected internal server error occurred.';
    const details = err.details || [];

    res.status(statusCode).json({
      error: {
        code: errorCode,
        message,
        details: Array.isArray(details) ? details : [details],
      },
    });
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Graceful shutdown
  const shutdown = () => {
    console.log('Received termination signal, shutting down gracefully...');
    server.close(() => {
      console.log('HTTP and WebSocket server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoCollect] Full-Stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EcoCollect server:', err);
  process.exit(1);
});
