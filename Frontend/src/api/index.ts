import axios from 'axios';
import { Campaign, CampaignFormData, LinkedInProfile, PersonalizedMessage, Lead, CampaignStatus } from '../types';

// const LINKEDIN_EMAIL = 'aman212343221@gmail.com';
// const LINKEDIN_PASSWORD = 'Chaudhary@1212';

// Use environment variable or fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://18.206.140.165:5001/api';
console.log('API Base URL:', API_BASE_URL); // Debug log to see the actual URL being used

// Create axios instance with enhanced error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for potentially slow connections
  timeout: 10000,
  // Allow cookies to be sent in cross-origin requests
  withCredentials: false
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request configuration error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Campaign API calls with fallback mock data for development
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await api.get('/campaigns');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    // Check if we're in development mode to provide mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock campaign data for development');
      return [
        { 
          _id: '1', 
          name: 'Sample Campaign', 
          description: 'Mock data for development', 
          status: CampaignStatus.ACTIVE, 
          leads: [],
          accountIDs: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    throw error;
  }
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  try {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch campaign ${id}:`, error);
    throw error;
  }
};

export const createCampaign = async (campaign: CampaignFormData): Promise<Campaign> => {
  try {
    const response = await api.post('/campaigns', campaign);
    return response.data;
  } catch (error) {
    console.error('Failed to create campaign:', error);
    throw error;
  }
};

export const updateCampaign = async (id: string, campaign: Partial<CampaignFormData>): Promise<Campaign> => {
  try {
    const response = await api.put(`/campaigns/${id}`, campaign);
    return response.data;
  } catch (error) {
    console.error(`Failed to update campaign ${id}:`, error);
    throw error;
  }
};

export const deleteCampaign = async (id: string): Promise<void> => {
  try {
    await api.delete(`/campaigns/${id}`);
  } catch (error) {
    console.error(`Failed to delete campaign ${id}:`, error);
    throw error;
  }
};

// LinkedIn Message API call
export const generatePersonalizedMessage = async (profileData: LinkedInProfile): Promise<PersonalizedMessage> => {
  try {
    const response = await api.post('/personalized-message', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to generate personalized message:', error);
    throw error;
  }
};

// Scraper APIs
export const startScraping = async (
  searchUrl: string,
  linkedinEmail: string,
  linkedinPassword: string,
  maxProfiles?: number
): Promise<{ message: string }> => {
  try {
    const response = await api.post('/scrape/start', { 
      searchUrl,
      linkedinEmail,
      linkedinPassword,
      maxProfiles
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start scraping:', error);
    throw error;
  }
};

export const getScrapedLeads = async (): Promise<Lead[]> => {
  try {
    const response = await api.get('/scrape/leads');
    return response.data;
  } catch (error) {
    console.error('Failed to get scraped leads:', error);
    throw error;
  }
};

export const getSourceUrls = async (): Promise<string[]> => {
  try {
    const response = await api.get('/scrape/sources');
    return response.data;
  } catch (error) {
    console.error('Failed to get source URLs:', error);
    throw error;
  }
};

export const getLeadsBySource = async (sourceUrl: string): Promise<Lead[]> => {
  try {
    const response = await api.get('/scrape/leads/source', {
      params: { url: sourceUrl }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get leads by source:', error);
    throw error;
  }
}; 