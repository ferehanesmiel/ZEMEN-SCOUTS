import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

// Import routers
import authRouter from './api/auth.js';
import usersRouter from './api/users.js';
import walletRouter from './api/wallet.js';
import scoutsRouter from './api/scouts.js';
import marketRouter from './api/market.js';
import ordersRouter from './api/orders.js';
import deliveryRouter from './api/delivery.js';
import trackingRouter from './api/tracking.js';
import donationsRouter from './api/donations.js';
import ratingsRouter from './api/ratings.js';
import notificationsRouter from './api/notifications.js';
import adminRouter from './api/admin.js';

import { rateLimiter } from './api/middleware/rateLimit.js';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Setup Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  app.use(cors());
  app.use(express.json());
  app.use(rateLimiter);

  // Attach io to req for use in routes
  app.use((req, res, next) => {
    (req as any).io = io;
    next();
  });

  // API Routes
  const apiRouter = express.Router();
  
  apiRouter.use('/auth', authRouter);
  apiRouter.use('/users', usersRouter);
  apiRouter.use('/wallet', walletRouter);
  apiRouter.use('/scouts', scoutsRouter);
  apiRouter.use('/market', marketRouter);
  apiRouter.use('/orders', ordersRouter);
  apiRouter.use('/delivery', deliveryRouter);
  apiRouter.use('/tracking', trackingRouter);
  apiRouter.use('/donations', donationsRouter);
  apiRouter.use('/ratings', ratingsRouter);
  apiRouter.use('/notifications', notificationsRouter);
  apiRouter.use('/admin', adminRouter);

  app.use('/api/v1', apiRouter);

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_delivery', (deliveryId) => {
      socket.join(`delivery_${deliveryId}`);
      console.log(`Socket ${socket.id} joined delivery_${deliveryId}`);
    });

    socket.on('rider_location_update', (data) => {
      // Broadcast to users tracking this delivery
      io.to(`delivery_${data.deliveryId}`).emit('rider_location_update', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
