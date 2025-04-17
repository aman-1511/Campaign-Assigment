import { Request, Response } from 'express';
import Campaign, { CampaignStatus } from '../models/Campaign';

// Get all campaigns (excluding deleted ones)
export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find({ status: { $ne: CampaignStatus.DELETED } });
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
};

// Get campaign by ID
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    if (campaign.status === CampaignStatus.DELETED) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Failed to fetch campaign' });
  }
};

// Create a new campaign
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const newCampaign = new Campaign({
      name: req.body.name,
      description: req.body.description,
      status: req.body.status || CampaignStatus.INACTIVE,
      leads: req.body.leads || [],
      accountIDs: req.body.accountIDs || [],
    });
    
    const savedCampaign = await newCampaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
};

// Update campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    if (campaign.status === CampaignStatus.DELETED) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Failed to update campaign' });
  }
};

// Soft delete campaign (set status to DELETED)
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    const deletedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: CampaignStatus.DELETED },
      { new: true }
    );
    
    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Failed to delete campaign' });
  }
}; 