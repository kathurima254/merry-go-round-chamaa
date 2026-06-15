import { query, transaction } from '../database/connection';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class ContributionService {
  async recordContribution(
    userId: string,
    groupId: string,
    amount: number,
    dueDate: Date
  ): Promise<any> {
    return transaction(async (client) => {
      const contributionId = uuidv4();

      // Create contribution record
      const result = await client.query(
        `INSERT INTO contributions (id, user_id, group_id, amount, status, due_date, paid_date, created_at)
         VALUES ($1, $2, $3, $4, 'completed', $5, NOW(), NOW())
         RETURNING *`,
        [contributionId, userId, groupId, amount, dueDate]
      );

      // Add to wallet
      await client.query(
        `INSERT INTO wallet (id, user_id, amount, type, transaction_id, description, created_at)
         VALUES ($1, $2, $3, 'contribution', $4, $5, NOW())`,
        [uuidv4(), userId, amount, contributionId, `Contribution to group`]
      );

      // Calculate reserve fund contribution (5%)
      const reserveAmount = amount * 0.05;
      await client.query(
        `INSERT INTO reserve_fund (id, group_id, amount, source, transaction_id, created_at)
         VALUES ($1, $2, $3, 'contribution_percentage', $4, NOW())`,
        [uuidv4(), groupId, reserveAmount, contributionId]
      );

      logger.info(`Contribution recorded: ${contributionId}`);
      return result.rows[0];
    });
  }

  async handleMissedContribution(
    userId: string,
    groupId: string,
    contributionId: string
  ): Promise<any> {
    return transaction(async (client) => {
      // Get member's missed count
      const missResult = await client.query(
        `SELECT COUNT(*) as missed_count FROM missed_contributions 
         WHERE user_id = $1 AND group_id = $2`,
        [userId, groupId]
      );

      const missCount = parseInt(missResult.rows[0].missed_count) + 1;

      // Get group settings
      const groupResult = await client.query(
        `SELECT penalty_first_miss, penalty_second_miss FROM groups WHERE id = $1`,
        [groupId]
      );

      const group = groupResult.rows[0];
      let fineAmount = 0;

      if (missCount === 1) {
        fineAmount = (100 * group.penalty_first_miss) / 100; // KES 1,000 * 10%
      } else if (missCount === 2) {
        fineAmount = (100 * group.penalty_second_miss) / 100;
      } else if (missCount >= 3) {
        // Remove from group on third miss
        await client.query(
          `UPDATE group_members SET status = 'removed', removed_at = NOW() 
           WHERE user_id = $1 AND group_id = $2`,
          [userId, groupId]
        );
        throw new AppError('Member removed from group after third missed contribution', 400);
      }

      // Calculate fine split: 5% APP, 5% MEMBERS
      const appShare = fineAmount * 0.05;
      const membersShare = fineAmount * 0.05;

      // Create missed contribution record
      const missedId = uuidv4();
      await client.query(
        `INSERT INTO missed_contributions 
         (id, user_id, group_id, contribution_id, miss_count, fine_amount, app_share, member_share, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [missedId, userId, groupId, contributionId, missCount, fineAmount, appShare, membersShare]
      );

      // Record fine to wallet
      await client.query(
        `INSERT INTO wallet (id, user_id, amount, type, transaction_id, description, created_at)
         VALUES ($1, $2, $3, 'penalty', $4, $5, NOW())`,
        [uuidv4(), userId, -fineAmount, missedId, `Fine for missed contribution`]
      );

      // Add members share to reserve fund
      await client.query(
        `INSERT INTO reserve_fund (id, group_id, amount, source, transaction_id, created_at)
         VALUES ($1, $2, $3, 'penalty', $4, NOW())`,
        [uuidv4(), groupId, membersShare, missedId]
      );

      logger.info(`Missed contribution handled: ${missedId} (Miss #${missCount})`);
      return { missCount, fineAmount, appShare, membersShare };
    });
  }
}

export default new ContributionService();
