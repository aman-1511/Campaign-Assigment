"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const campaignRoutes_1 = __importDefault(require("./routes/campaignRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const scraperRoutes_1 = __importDefault(require("./routes/scraperRoutes"));
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campaign-manager';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Routes
app.use('/api/campaigns', campaignRoutes_1.default);
app.use('/api/personalized-message', messageRoutes_1.default);
app.use('/api/scrape', scraperRoutes_1.default);
// Root route
app.get('/', (req, res) => {
    res.send('Campaign Manager API is running');
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
