const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/lost-found', require('./routes/lostFoundRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

cron.schedule('*/5 * * * *', async () => {
  try {
    const response = await fetch(`${backendUrl}/health`);
    console.log(`Health ping: ${response.status}`);
  } catch (error) {
    console.error(`Health ping failed: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
});
