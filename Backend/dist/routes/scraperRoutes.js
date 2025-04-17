"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scraperController_1 = require("../controllers/scraperController");
const router = express_1.default.Router();
/**
 * @route POST /api/scrape/start
 * @desc Initiate LinkedIn profile scraping from a search URL
 * @access Public (or protected if needed)
 * @body { "searchUrl": "string" }
 */
router.post('/start', scraperController_1.startScraping);
/**
 * @route GET /api/scrape/leadsx
 * @desc Fetch all previously scraped leads
 * @access Public (or protected if needed)
 */
router.get('/leads', scraperController_1.getLeads);
/**
 * @route GET /api/scrape/sources
 * @desc Fetch all unique source URLs used for scraping
 * @access Public (or protected if needed)
 */
router.get('/sources', scraperController_1.getSourceUrls);
/**
 * @route GET /api/scrape/leads/source
 * @desc Fetch leads by source URL
 * @access Public (or protected if needed)
 * @query { "url": "string" }
 */
router.get('/leads/source', scraperController_1.getLeadsBySource);
exports.default = router;
