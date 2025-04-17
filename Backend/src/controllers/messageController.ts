import { Request, Response } from 'express';
import axios from 'axios';

// Generate personalized LinkedIn message using Gemini API
export const generatePersonalizedMessage = async (req: Request, res: Response) => {
  try {
    const { name, job_title, company, location, summary } = req.body;
    
    // Validate required fields
    if (!name || !job_title || !company) {
      return res.status(400).json({ message: 'Name, job title, and company are required' });
    }
    
    // Create prompt for AI
    const prompt = `Generate a personalized LinkedIn outreach message for a sales campaign.
Person details:
- Name: ${name}
- Job Title: ${job_title}
- Company: ${company}
- Location: ${location || 'Not specified'}
- Profile Summary: ${summary || 'Not available'}

Create a professional, friendly, and personalized message that mentions their role and company, and offers value without being too pushy. Keep it concise (under 150 words).`;

    // Gemini API endpoint
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Call Gemini API
    const response = await axios.post(
      `${endpoint}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      }
    );
    
    // Extract the generated message from the response
    const message = response.data.candidates[0].content.parts[0].text;
    res.status(200).json({ message });
  } catch (error) {
    console.error('Error generating message:', error);
    res.status(500).json({ message: 'Failed to generate personalized message' });
  }
}; 