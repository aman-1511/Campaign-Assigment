export enum CampaignStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted'
}

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  leads: string[];
  accountIDs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  status: CampaignStatus;
  leads: string[];
  accountIDs: string[];
}

export interface Lead {
  _id: string;
  fullName: string;
  headline?: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  profileUrl: string;
  summary?: string;
  additionalInfo?: string;
  sourceUrl: string;
  scrapedAt: string;
  profileImage?: string; // Base64 encoded image or URL
}

export interface LinkedInProfile {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
}

export interface PersonalizedMessage {
  message: string;
} 