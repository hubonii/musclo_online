/**
 * Main application entry point for the Musclo API.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();
app.set('trust proxy', 1); // Trust proxy to allow secure cookies across Railway load balancers
const PORT = process.env.PORT || 8080;


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));


const defaultOrigins = ['https://musclo.tech', 'https://www.musclo.tech'];
const envOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));


const passport = require('./config/passport');
app.use(passport.initialize());



app.use('/storage', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static('public/storage'));
app.use('/uploads', express.static('uploads'));

const authController = require('./controllers/authController');
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

app.get('/', (req, res) => {

  res.json({ message: 'Musclo API (Node.js) is running' });
});

/**
 * Initializes the database connection and starts the Express server.
 */
const startServer = async () => {
  try {

    if (process.env.NODE_ENV === 'test' && process.env.TEST_DB_GUARD !== 'enabled') {
      throw new Error('Blocked: set TEST_DB_GUARD=enabled for test startup safety.');
    }

    await sequelize.authenticate();
    console.log('Database connected successfully.');


    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });


    (async () => {
      try {
        if (process.env.DB_ALTER === 'true') {
          console.log('Syncing database models (alter: true)...');
          await sequelize.sync({ alter: true });
        } else {
          console.log('Syncing database models (no alter)...');
          await sequelize.sync();
        }
        
        console.log('Seeding baseline data...');
        const seedExercises = require('./seeders/detectAnatomySplit');
        await seedExercises();
      } catch (err) {
        console.error('Background startup task failed:', err);
      }
    })();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = app;

if (require.main === module) {
  startServer();
}
