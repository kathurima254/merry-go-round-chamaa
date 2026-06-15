import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);
router.use(authorize('super_admin'));

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await query(
      `SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM groups) as total_groups,
        (SELECT COALESCE(SUM(amount), 0) FROM wallet) as total_volume,
        (SELECT COALESCE(SUM(amount), 0) FROM reserve_fund) as reserve_balance`
    );

    res.json({
      success: true,
      data: stats.rows[0],
    });
  } catch (error) {
    throw new AppError('Failed to fetch admin stats', 500);
  }
});

export default router;
