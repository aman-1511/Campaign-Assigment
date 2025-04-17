import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import campaignRoutes from './routes/campaignRoutes';
import messageRoutes from './routes/messageRoutes';
import scraperRoutes from './routes/scraperRoutes';





dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campaign-manager';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/personalized-message', messageRoutes);
app.use('/api/scrape', scraperRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Campaign Manager API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 