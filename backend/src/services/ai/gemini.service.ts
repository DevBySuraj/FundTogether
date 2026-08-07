import fs from 'fs';
import { getGeminiClient } from '../../config/gemini';
import { buildVerificationPrompt } from './promptBuilder';
import { parseAndValidateAiResponse } from './responseValidator';
import { IAIVerificationResult } from '../../interfaces/verification.interface';
import { logger } from '../../utils/logger';

export class GeminiService {
  /**
   * Analyzes an uploaded document using Google Gemini Vision API for OCR & verification.
   * @param filePath Absolute path to local document file
   * @param mimeType MIME type of uploaded file
   */
  public async analyzeDocument(filePath: string, mimeType: string): Promise<IAIVerificationResult> {
    const genAI = getGeminiClient();
    const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    const fileBuffer = fs.readFileSync(filePath);
    const imagePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const prompt = buildVerificationPrompt();

    let rawText = '';
    let successModel = '';
    let lastErrorMsg = '';

    // Try active Gemini Vision models
    for (const modelName of candidateModels) {
      try {
        logger.info(`[Gemini Service] Sending document to Google Gemini API using model ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        rawText = response.text();
        if (rawText) {
          successModel = modelName;
          break;
        }
      } catch (modelErr: any) {
        lastErrorMsg = modelErr.message || String(modelErr);
        logger.warn(`[Gemini Service] Model ${modelName} call returned: ${lastErrorMsg}`);

        // Break early if rate limit / quota exceeded error
        if (lastErrorMsg.includes('429') || lastErrorMsg.includes('quota')) {
          throw new Error('Google Gemini API Rate Limit / Quota Exceeded. Please retry in 30 seconds or create a new free API key at https://aistudio.google.com/');
        }
      }
    }

    if (rawText) {
      logger.info(`[Gemini Service] Successfully received live AI response from Google Gemini (${successModel}).`);
      return parseAndValidateAiResponse(rawText);
    }

    logger.error(`[Gemini Service] Gemini AI did not respond. Reason: ${lastErrorMsg}`);
    throw new Error(`Gemini AI did not respond. Reason: ${lastErrorMsg || 'Invalid GEMINI_API_KEY or connection error.'}`);
  }
}

export const geminiService = new GeminiService();
