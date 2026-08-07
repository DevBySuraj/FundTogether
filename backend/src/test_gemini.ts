import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is missing');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ['gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-pro'];

  for (const modelName of candidateModels) {
    try {
      console.log(`\nTrying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say Hello in JSON: {"status": "ok"}');
      const response = await result.response;
      console.log(`✅ SUCCESS with ${modelName}:`, response.text());
      return modelName;
    } catch (err: any) {
      console.log(`❌ Failed with ${modelName}:`, err.message || err);
    }
  }
}

testGeminiModels();
