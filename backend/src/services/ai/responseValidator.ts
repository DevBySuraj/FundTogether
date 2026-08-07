import { IAIVerificationResult, RiskLevel } from '../../interfaces/verification.interface';

export const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

export const parseAndValidateAiResponse = (rawText: string): IAIVerificationResult => {
  const cleanedText = cleanJsonResponse(rawText);

  try {
    const parsed = JSON.parse(cleanedText);

    const validRiskLevels: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
    const risk: RiskLevel = validRiskLevels.includes(parsed.risk) ? parsed.risk : 'Medium';

    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(100, parsed.confidence))
      : 70;

    return {
      documentType: parsed.documentType || 'Unknown Document',
      confidence,
      risk,
      summary: parsed.summary || 'Document details analyzed by TrustChain AI engine.',
      recommendation: parsed.recommendation || 'Manual Review',
      extractedText: parsed.extractedText || '',
    };
  } catch (error) {
    console.warn('[AI Validator] Failed to parse AI JSON response. Returning fallback payload.', error);
    return {
      documentType: 'Document Verification',
      confidence: 65,
      risk: 'Medium',
      summary: 'AI output parsed with fallback defaults due to response format irregularity.',
      recommendation: 'Manual Review',
      extractedText: rawText.substring(0, 500),
    };
  }
};
