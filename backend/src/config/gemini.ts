import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

let genAI: GoogleGenerativeAI | null = null;

export const getGeminiClient = (): GoogleGenerativeAI => {
  if (!genAI) {
    const apiKey = env.geminiApiKey;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[Gemini Config] GEMINI_API_KEY is not set or using default template. Mock AI responses will be fallback if key fails.');
    }
    genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');
  }
  return genAI;
};
