import { Request, Response } from 'express';
import { trustScoreService } from '../services/trust/trustScore.service';
import { sendSuccess, sendError } from '../utils/response';

export class TrustController {
  public getTrustReport = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const report = await trustScoreService.generateTrustReport(id);

      return sendSuccess(res, report, 'Trust report generated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate trust report', 500);
    }
  };
}

export const trustController = new TrustController();
