import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

/**
 * @route POST /verification/upload & POST /verification/upload-doc
 * @desc Upload document file for Gemini AI OCR & verification analysis
 */
router.post('/upload', uploadMiddleware.single('document'), verificationController.uploadDocument);
router.post('/upload-doc', uploadMiddleware.single('document'), verificationController.uploadDocument);

/**
 * @route GET /verification/status/:id
 * @desc Get status of a document verification
 */
router.get('/status/:id', verificationController.getStatus);

export default router;
