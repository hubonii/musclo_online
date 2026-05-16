/**
 * @file index.js
 * @description Main application entry point for the Musclo API.
 * Optimized for Serverless execution on Vercel and production deployment.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();

// Trust proxy configurations to ensure secure cookie delivery across cloud infrastructure
app.set('trust proxy', 1);

const PORT = process.env.PORT || 8080;

// Secure application HTTP headers with optimized cross-origin resource strategies
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Compile full whitelist of authorized client domains
const defaultOrigins = ['https://musclo.tech', 'https://musclo.tech'];
const envOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

// Unified CORS and explicit preflight routing configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server or programmatic requests lacking an origin header
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Bind main CORS handler and handle global preflight OPTIONS requests uniformly
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Direct fallback header injection rule to bypass proxy level preflight dropouts
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Fix to intercept accidental double slashes (//) sent from client routes without redirection
app.use((req, res, next) => {
  if (req.url.startsWith('//')) {
    req.url = req.url.replace(/\/\/+/g, '/');
  }
  next();
});

// Middleware configuration for request payload parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Passport security context initialization
const passport = require('./config/passport');
app.use(passport.initialize());

// Static storage serving assets with cross-origin bypass rules
app.use('/storage', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static('public/storage'));

app.use('/uploads', express.static('uploads'));

// Primary Routing Subsystems
const authRoutes = require('./routes/auth');
const { protect, verified } = require('./middleware/auth');

app.use('/api', authRoutes);
app.use('/api/exercises', protect, verified, require('./routes/exerciseRoutes'));
app.use('/api/programs', protect, verified, require('./routes/programRoutes'));
app.use('/api/routines', protect, verified, require('./routes/routineRoutes'));
app.use('/api/workouts', protect, verified, require('./routes/workoutLogRoutes'));
app.use('/api/analytics', protect, verified, require('./routes/analyticsRoutes'));
app.use('/api/measurements', protect, verified, require('./routes/measurementRoutes'));
app.use('/api/progress-photos', protect, verified, require('./routes/progressPhotoRoutes'));
app.use('/api/settings', protect, require('./routes/settingsRoutes'));
app.use('/api/profile', protect, require('./routes/profileRoutes'));
app.use('/api/chat', protect, verified, require('./routes/aiCoachRoutes'));
app.use('/api/export', protect, verified, require('./routes/exportRoutes'));

// Silence automatic browser favicon requests to avoid 404 logs cluttering production
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());

// Root connection verification target
app.get('/', (req, res) => {
  res.json({ message: 'Musclo API (Node.js) is running' });
});

/**
 * Initializes the database connection for Serverless environments.
 * Heavy migrations and automated initial seeders are isolated from the main function.
 */
const startServer = async () => {
  try {
    if (process.env.NODE_ENV === 'test' && process.env.TEST_DB_GUARD !== 'enabled') {
      throw new Error('Blocked: set TEST_DB_GUARD=enabled for test startup safety.');
    }

    // Authenticate connectivity instantly without executing blocking operations
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Invoke server listener directly only during local development testing
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Local development server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Unable to connect to the database during initialization:', error);
  }
};

// Export app instance explicitly as required by Vercel handlers
module.exports = app;

// Initiate non-blocking connection tests
startServer();
