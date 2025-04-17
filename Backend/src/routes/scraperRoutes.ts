import express from 'express';
import { startScraping, getLeads, getSourceUrls, getLeadsBySource } from '../controllers/scraperController';

const router = express.Router();

/**
 * @route POST /api/scrape/start
 * @desc Initiate LinkedIn profile scraping from a search URL
 * @access Public (or protected if needed)
 * @body { "searchUrl": "string" }
 */
router.post('/start', startScraping);

/**
 * @route GET /api/scrape/leadsx
 * @desc Fetch all previously scraped leads
 * @access Public (or protected if needed)
 */
router.get('/leads', getLeads);

/**
 * @route GET /api/scrape/sources
 * @desc Fetch all unique source URLs used for scraping
 * @access Public (or protected if needed)
 */
router.get('/sources', getSourceUrls);

/**
 * @route GET /api/scrape/leads/source
 * @desc Fetch leads by source URL
 * @access Public (or protected if needed)
 * @query { "url": "string" }
 */
router.get('/leads/source', getLeadsBySource);

export default router; 