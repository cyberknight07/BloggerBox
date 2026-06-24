import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import postRoutes from './modules/posts/posts.routes.js';
import commentRoutes from './modules/comments/comments.routes.js';
import tagRoutes from './modules/tags/tags.routes.js';
import likeRoutes from './modules/likes/likes.routes.js';

const app = express();

// Security & logging
app.use(helmet());
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);   // nested: POST /api/posts/:slug/comments
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/posts', likeRoutes);      // nested: POST /api/posts/:slug/likes

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler (must be last)
app.use(errorHandler);

export default app;
