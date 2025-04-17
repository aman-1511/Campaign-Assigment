import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  fullName: string;
  shorthand?: string;
  headline?: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  profileUrl: string;
  summary?: string;
  additionalInfo?: string;
  sourceUrl: string;
  scrapedAt: Date;
  profileImage?: string; // To store the profile image as base64 or URL
}

const LeadSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  shorthand: { type: String, required: false },
  headline: { type: String, required: false },
  jobTitle: { type: String, required: false },
  companyName: { type: String, required: false },
  location: { type: String, required: false },
  profileUrl: { type: String, required: true },
  summary: { type: String, required: false },
  additionalInfo: { type: String, required: false },
  sourceUrl: { type: String, required: true },
  scrapedAt: { type: Date, default: Date.now, required: true },
  profileImage: { type: String, required: false }, // Store image as base64 string
});

// Create a compound index on profileUrl and sourceUrl to ensure uniqueness for the combination
LeadSchema.index({ profileUrl: 1, sourceUrl: 1 }, { unique: true });

export default mongoose.model<ILead>('Lead', LeadSchema); 