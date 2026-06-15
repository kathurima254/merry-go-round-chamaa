import { Router, Request, Response } from 'express';
import { query, transaction } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { transactionLimiter } from '../middleware/rateLimiter';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const router = Router();

router.use(authenticate);

const withdrawalSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('instant', 'chamaa').required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
});

router.post('/withdraw', transactionLimiter, async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new AppError('User not authenticated', 401);

    const { error, value } = withdrawalSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const { amount, type, phone } = value;

    await transaction(async (client) => {
      // Check wallet balance
      const balanceResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as balance FROM wallet WHERE user_id = $1',
        [req.user!.id]
      );

      const balance = balanceResult.rows[0].balance;

      if (balance < amount) {
        throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
      }

      // Calculate tax & penalties
      const tax = type === 'instant' ? amount * 0.01 : 0;
      const penalty = type === 'chamaa' ? amount * 0.1 : 0;
      const netAmount = amount - tax - penalty;

      if (netAmount <= 0) {
        throw new AppError('Withdrawal amount too small', 400);
      }

      // Record withdrawal
      const withdrawalId = uuidv4();
      await client.query(
        `INSERT INTO withdrawals (id, user_id, amount, type, tax, penalty, status, phone, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())`,
        [withdrawalId, req.user!.id, amount, type, tax, penalty, phone]
      );

      // Deduct from wallet
      await client.query(
        'INSERT INTO wallet (id, user_id, amount, type, transaction_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [uuidv4(), req.user!.id, -amount, 'withdrawal', withdrawalId]
      );
    });

    res.json({
      success: true,
      message: 'Withdrawal initiated',
      data: { status: 'pending' },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Withdrawal failed', 500);
  }
});

export default router;
