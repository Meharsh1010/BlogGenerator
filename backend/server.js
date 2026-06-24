import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dns from 'dns';
import connectDB from './config/db.js';

// Load environment variables FIRST before anything else
dotenv.config();

// Configure public DNS resolvers to bypass misconfigured local router/VPN DNS servers (fixes Atlas SRV lookups)
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Route imports
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';
import generateRoutes from './routes/generate.js';
import commentRoutes from './routes/comments.js';

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  (process.env.FRONTEND_URL || 'https://blog-generator-eight.vercel.app').replace(/\/$/, '')
];

console.log('Allowed CORS origins:', allowedOrigins);

// CORS must come BEFORE helmet so headers are set on every response
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: "${origin}"`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight OPTIONS requests immediately (before helmet touches them)
app.options('*', cors());

// Security middlewares — crossOriginResourcePolicy disabled so cross-origin
// API responses are not blocked by CORP after CORS headers are set
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false, // Allows cross-origin fetch for API responses
}));

app.use(express.json());
app.use(cookieParser());

// Disable caching for dynamic API responses — skip SSE stream routes (they manage their own headers)
app.use('/api', (req, res, next) => {
  if (req.path.endsWith('/stream')) return next(); // SSE manages its own cache headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'BlogGenerator API is running 🚀', status: 'ok' });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blogs', generateRoutes); // Merged outline, stream, inline-edit routes under /api/blogs
app.use('/api/comments', commentRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(`Unhandled Server Error: ${err.stack}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
