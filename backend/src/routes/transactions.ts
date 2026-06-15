import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/history', async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new AppError('User not authenticated', 401);

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT * FROM wallet WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: { limit, offset },
    });
  } catch (error) {
    throw new AppError('Failed to fetch transactions', 500);
  }
});

export default router;
