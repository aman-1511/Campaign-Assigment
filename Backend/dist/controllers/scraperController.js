"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadsBySource = exports.getSourceUrls = exports.getLeads = exports.startScraping = void 0;
const scraperService_1 = require("../services/scraperService");
const startScraping = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchUrl, linkedinEmail, linkedinPassword, maxProfiles } = req.body;
    if (!searchUrl || typeof searchUrl !== 'string') {
        res.status(400).json({ message: 'Missing or invalid searchUrl in request body' });
        return;
    }
    // Validate LinkedIn credentials
    if (!linkedinEmail || typeof linkedinEmail !== 'string') {
        res.status(400).json({ message: 'Missing or invalid LinkedIn email' });
        return;
    }
    if (!linkedinPassword || typeof linkedinPassword !== 'string') {
        res.status(400).json({ message: 'Missing or invalid LinkedIn password' });
        return;
    }
    // Basic URL validation
    try {
        const url = new URL(searchUrl);
        if (!url.hostname.includes('linkedin.com')) {
            console.warn(`Received non-LinkedIn URL: ${searchUrl}`);
            res.status(400).json({ message: 'URL must be a linkedin.com URL' });
            return;
        }
        // Add more specific checks if needed, e.g., for /search/results/people
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid URL format provided' });
        return;
    }
    try {
        console.log(`Received scraping request for URL: ${searchUrl}`);
        // Set default value for maxProfiles if not provided
        const profiles = maxProfiles && typeof maxProfiles === 'number' ? maxProfiles : 5;
        // Don't wait for the scraping to finish. Run it in the background.
        scraperService_1.ScraperService.scrapeLinkedInSearch(searchUrl, profiles, linkedinEmail, linkedinPassword)
            .then(scrapedLeads => {
            console.log(`Scraping completed in background for ${searchUrl}. Found ${scrapedLeads.length} new/updated leads.`);
            // TODO: Implement real-time notification (e.g., WebSocket) if needed
        })
            .catch(error => {
            // Log the error for background task failure
            console.error(`Background scraping task failed for ${searchUrl}:`, error);
        });
        // Immediately respond to the client that the process has started
        res.status(202).json({ message: 'Scraping process initiated in background. Check results later.' });
    }
    catch (error) {
        // Catch errors during the *initiation* of the scraping process
        console.error('Error initiating scraping process:', error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred while starting the scraping.';
        res.status(500).json({ message });
    }
});
exports.startScraping = startScraping;
const getLeads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leads = yield scraperService_1.ScraperService.getAllLeads();
        res.status(200).json(leads);
    }
    catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Failed to fetch leads' });
    }
});
exports.getLeads = getLeads;
const getSourceUrls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sourceUrls = yield scraperService_1.ScraperService.getSourceUrls();
        res.status(200).json(sourceUrls);
    }
    catch (error) {
        console.error('Error fetching source URLs:', error);
        res.status(500).json({ message: 'Failed to fetch source URLs' });
    }
});
exports.getSourceUrls = getSourceUrls;
const getLeadsBySource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        res.status(400).json({ message: 'Missing or invalid source URL parameter' });
        return;
    }
    try {
        const leads = yield scraperService_1.ScraperService.getLeadsBySourceUrl(url);
        res.status(200).json(leads);
    }
    catch (error) {
        console.error('Error fetching leads by source:', error);
        res.status(500).json({ message: 'Failed to fetch leads by source URL' });
    }
});
exports.getLeadsBySource = getLeadsBySource;
