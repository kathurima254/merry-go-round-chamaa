import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import aiService from '../services/aiService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

/**
 * Chat with AI Assistant
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new AppError('User not authenticated', 401);

    const { message, context = 'general' } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const response = await aiService.processMessage(req.user.id, message, context);

    res.json({
      success: true,
      data: { response },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to process message', 500);
  }
});

/**
 * Get AI Insights
 */
router.get('/insights', async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new AppError('User not authenticated', 401);

    // Generate spending insights
    const insights = {
      balance: await aiService.processMessage(req.user.id, 'balance', 'wallet'),
      spending: await aiService.processMessage(req.user.id, 'spending', 'wallet'),
      contributions: await aiService.processMessage(req.user.id, 'contributions', 'groups'),
    };

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to generate insights', 500);
  }
});

export default router;
