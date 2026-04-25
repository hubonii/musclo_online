// Main API entry: configure middleware, routes, and startup.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8080;

// Security headers (CSP, X-Frame-Options, HSTS, etc.).
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Allow one or more frontend origins and keep cookies enabled for auth.
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://musclo.tech', 'https://www.musclo.tech'];
const envOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or requests from allowed origins.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
// Parses URL-encoded form payloads (used by some non-JSON clients).
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Serve uploaded media from predictable public URLs.
// Explicit CORP header so cross-origin frontends can load these assets.
app.use('/storage', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static('public/storage'));
app.use('/uploads', express.static('uploads'));

const authController = require('./controllers/authController');
const authRoutes = require('./routes/auth');
const exerciseRoutes = require('./routes/exerciseRoutes');

app.use('/api', authRoutes);
// Feature routes are grouped under `/api/*` for consistent frontend base URL usage.
app.use('/api/exercises', exerciseRoutes);
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/routines', require('./routes/routineRoutes'));
app.use('/api/workouts', require('./routes/workoutLogRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/measurements', require('./routes/measurementRoutes'));
app.use('/api/progress-photos', require('./routes/progressPhotoRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/chat', require('./routes/aiCoachRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

app.get('/', (req, res) => {
  // Lightweight health/info endpoint for quick server checks.
  res.json({ message: 'Musclo API (Node.js) is running' });
});

// Connect DB, sync models, seed baseline data, then start listening.
const startServer = async () => {
  try {
    // Safety check so test mode does not hit DB unless explicitly allowed.
    if (process.env.NODE_ENV === 'test' && process.env.TEST_DB_GUARD !== 'enabled') {
      throw new Error('Blocked: set TEST_DB_GUARD=enabled for test startup safety.');
    }

    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Syncs model definitions with DB tables before serving requests.
    await sequelize.sync();

    // Seeds baseline exercise catalog if entries are missing.
    const seedExercises = require('./seeders/detectAnatomySplit');
    await seedExercises();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = app;

if (require.main === module) {
  startServer();
}
