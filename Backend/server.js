require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./Routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const courtRoutes = require('./Routes/courtRoutes');
const judgeRoutes = require('./Routes/judgeRoutes');
const caseRoutes = require('./Routes/caseRoutes');
const hearingRoutes = require('./Routes/hearingRoutes');
const documentRoutes = require('./Routes/documentRoutes');
const analyticsRoutes = require('./Routes/analyticsRoutes');
const userRoutes = require('./Routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Home route
app.get('/', (req, res) => {
  res.send('CFMS API is running');
});

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? 'Connected'
      : 'Disconnected';

  res.status(200).json({
    success: true,
    serverStatus: 'Healthy',
    databaseStatus: dbStatus,
    databaseName: mongoose.connection.name || 'Not connected',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export Express app for Vercel
module.exports = app;