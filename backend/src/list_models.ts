import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is missing');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const testModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.0-pro'];

  for (const m of testModels) {
    try {
      console.log(`Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Hello');
      const response = await result.response;
      console.log(`✅ SUCCESS with ${m}! Response:`, response.text());
      return;
    } catch (err: any) {
      console.log(`❌ ${m} failed:`, err.message || err);
    }
  }
}

listGeminiModels();
