import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import membersRoutes from './routes/members.js';
import savingsRoutes from './routes/savings.js';
import loansRoutes from './routes/loans.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-sacco';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://jimtechsug-glitch.github.io',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost'
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loans', loansRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SACCO Backend running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for production domains`);
});
