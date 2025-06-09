import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import riderRoutes from './routes/riders';
import roleRoutes from './routes/roles';
import documentRoutes from './routes/documents';
import testUploadRoutes from './routes/test-upload';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/test', testUploadRoutes);

// Serve test upload page and uploads directory
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'FLCD Backend API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FLCD Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      riders: '/api/riders',
      roles: '/api/roles'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      status: 404
    }
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 FLCD Backend API running on port ${port}`);
      console.log(`📍 Health check: http://localhost:${port}/health`);
      console.log(`📍 API docs: http://localhost:${port}/`);
      console.log(`📍 Server binding: 0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();