import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { uploadMiddleware } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @route POST /verification/upload
 * @desc Upload document file for Gemini AI OCR & verification analysis
 */
router.post('/upload', uploadMiddleware.single('document'), verificationController.uploadDocument);

/**
 * @route GET /verification/status/:id
 * @desc Get status of a document verification
 */
router.get('/status/:id', verificationController.getStatus);

export default router;
