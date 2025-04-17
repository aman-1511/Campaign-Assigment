import express from 'express';
import { 
  getAllCampaigns, 
  getCampaignById, 
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController';

const router = express.Router();

// GET all campaigns
router.get('/', getAllCampaigns);

// GET campaign by ID
router.get('/:id', getCampaignById);

// POST create a new campaign
router.post('/', createCampaign);

// PUT update campaign
router.put('/:id', updateCampaign);

// DELETE (soft delete) campaign
router.delete('/:id', deleteCampaign);

export default router; 