import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/profile', async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new AppError('User not authenticated', 401);

    const result = await query(
      `SELECT id, first_name, last_name, email, phone, role, created_at, 
              (SELECT COALESCE(SUM(amount), 0) FROM wallet WHERE user_id = $1) as wallet_balance
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch profile', 500);
  }
});

export default router;
