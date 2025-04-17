import axios from 'axios';
import { Campaign, CampaignFormData, LinkedInProfile, PersonalizedMessage, Lead } from '../types';

// const LINKEDIN_EMAIL = 'aman212343221@gmail.com';
// const LINKEDIN_PASSWORD = 'Chaudhary@1212';

// Use environment variable or fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Use port 5001 and add /api

const api = axios.create({
  baseURL: API_BASE_URL, // Use the corrected base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Campaign API calls - endpoints are now relative to the baseURL
export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get('/campaigns'); // Now hits http://localhost:5001/api/campaigns
  return response.data;
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  const response = await api.get(`/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (campaign: CampaignFormData): Promise<Campaign> => {
  const response = await api.post('/campaigns', campaign);
  return response.data;
};

export const updateCampaign = async (id: string, campaign: Partial<CampaignFormData>): Promise<Campaign> => {
  const response = await api.put(`/campaigns/${id}`, campaign);
  return response.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await api.delete(`/campaigns/${id}`);
};

// LinkedIn Message API call
export const generatePersonalizedMessage = async (profileData: LinkedInProfile): Promise<PersonalizedMessage> => {
  const response = await api.post('/personalized-message', profileData);
  return response.data;
};

// Scraper APIs
export const startScraping = async (
  searchUrl: string,
  linkedinEmail: string,
  linkedinPassword: string,
  maxProfiles?: number
): Promise<{ message: string }> => {
  const response = await api.post('/scrape/start', { 
    searchUrl,
    linkedinEmail,
    linkedinPassword,
    maxProfiles
  });
  return response.data;
};

export const getScrapedLeads = async (): Promise<Lead[]> => {
  const response = await api.get('/scrape/leads');
  return response.data;
};

export const getSourceUrls = async (): Promise<string[]> => {
  const response = await api.get('/scrape/sources');
  return response.data;
};

export const getLeadsBySource = async (sourceUrl: string): Promise<Lead[]> => {
  const response = await api.get('/scrape/leads/source', {
    params: { url: sourceUrl }
  });
  return response.data;
}; 