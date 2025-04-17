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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePersonalizedMessage = void 0;
const axios_1 = __importDefault(require("axios"));
// Generate personalized LinkedIn message using Gemini API
const generatePersonalizedMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield axios_1.default.post(`${endpoint}?key=${apiKey}`, {
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
        });
        // Extract the generated message from the response
        const message = response.data.candidates[0].content.parts[0].text;
        res.status(200).json({ message });
    }
    catch (error) {
        console.error('Error generating message:', error);
        res.status(500).json({ message: 'Failed to generate personalized message' });
    }
});
exports.generatePersonalizedMessage = generatePersonalizedMessage;
