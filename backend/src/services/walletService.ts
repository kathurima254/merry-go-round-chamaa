import { query, transaction } from '../database/connection';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class WalletService {
  async getBalance(userId: string): Promise<number> {
    try {
      const result = await query(
        'SELECT COALESCE(SUM(amount), 0) as balance FROM wallet WHERE user_id = $1',
        [userId]
      );
      return result.rows[0].balance;
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw new AppError('Failed to get wallet balance', 500);
    }
  }

  async recordTransaction(
    userId: string,
    amount: number,
    type: string,
    description?: string,
    transactionId?: string
  ): Promise<any> {
    try {
      const id = uuidv4();
      const result = await query(
        `INSERT INTO wallet (id, user_id, amount, type, transaction_id, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [id, userId, amount, type, transactionId || null, description]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error recording transaction:', error);
      throw new AppError('Failed to record transaction', 500);
    }
  }

  async processWithdrawal(
    userId: string,
    amount: number,
    type: 'instant' | 'chamaa',
    phone: string
  ): Promise<any> {
    return transaction(async (client) => {
      // Get current balance
      const balanceResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as balance FROM wallet WHERE user_id = $1',
        [userId]
      );

      const balance = balanceResult.rows[0].balance;

      if (balance < amount) {
        throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
      }

      // Calculate fees
      const tax = type === 'instant' ? amount * 0.01 : 0;
      const penalty = type === 'chamaa' ? amount * 0.1 : 0;
      const netAmount = amount - tax - penalty;

      if (netAmount <= 0) {
        throw new AppError('Withdrawal amount too small after deductions', 400);
      }

      // Create withdrawal record
      const withdrawalId = uuidv4();
      const withdrawalResult = await client.query(
        `INSERT INTO withdrawals (id, user_id, amount, type, tax, penalty, net_amount, status, phone, requested_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, NOW())
         RETURNING *`,
        [withdrawalId, userId, amount, type, tax, penalty, netAmount, phone]
      );

      // Deduct from wallet
      await client.query(
        `INSERT INTO wallet (id, user_id, amount, type, transaction_id, description, created_at)
         VALUES ($1, $2, $3, 'withdrawal', $4, $5, NOW())`,
        [uuidv4(), userId, -amount, withdrawalId, `Withdrawal: ${type}`]
      );

      // Record tax to reserve if applicable
      if (tax > 0) {
        await client.query(
          `INSERT INTO wallet (id, user_id, amount, type, description, created_at)
           VALUES ($1, $2, $3, 'withdrawal_tax', $4, NOW())`,
          [uuidv4(), userId, -tax, `Tax on ${type} withdrawal`]
        );
      }

      logger.info(`Withdrawal processed: ${withdrawalId}`);
      return withdrawalResult.rows[0];
    });
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any> {
    try {
      const result = await query(
        `SELECT * FROM wallet WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching transaction history:', error);
      throw new AppError('Failed to fetch transaction history', 500);
    }
  }
}

export default new WalletService();
