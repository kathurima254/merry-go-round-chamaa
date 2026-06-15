import { query, transaction } from '../database/connection';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class GroupService {
  async createGroup(
    adminId: string,
    name: string,
    description: string,
    monthlyContribution: number,
    maxMembers: number = 100
  ): Promise<any> {
    return transaction(async (client) => {
      const groupId = uuidv4();

      // Create group
      const groupResult = await client.query(
        `INSERT INTO groups 
         (id, name, description, admin_id, monthly_contribution, max_members, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [groupId, name, description, adminId, monthlyContribution, maxMembers]
      );

      // Add admin as member
      await client.query(
        `INSERT INTO group_members (id, group_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, 'admin', NOW())`,
        [uuidv4(), groupId, adminId]
      );

      // Update current members count
      await client.query(
        `UPDATE groups SET current_members = 1 WHERE id = $1`,
        [groupId]
      );

      logger.info(`Group created: ${groupId} by ${adminId}`);
      return groupResult.rows[0];
    });
  }

  async addMember(groupId: string, userId: string, adminId: string): Promise<any> {
    return transaction(async (client) => {
      // Verify admin
      const adminCheck = await client.query(
        `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, adminId]
      );

      if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
        throw new AppError('Only group admins can add members', 403);
      }

      // Check if already member
      const existing = await client.query(
        `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );

      if (existing.rows.length > 0) {
        throw new AppError('User is already a member of this group', 400);
      }

      // Add member
      const memberId = uuidv4();
      await client.query(
        `INSERT INTO group_members (id, group_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, 'member', NOW())`,
        [memberId, groupId, userId]
      );

      // Update member count
      await client.query(
        `UPDATE groups SET current_members = current_members + 1 WHERE id = $1`,
        [groupId]
      );

      logger.info(`Member added to group: ${userId} to ${groupId}`);
      return { success: true };
    });
  }

  async getGroupStats(groupId: string): Promise<any> {
    try {
      const result = await query(
        `SELECT 
          g.id,
          g.name,
          g.admin_id,
          g.monthly_contribution,
          COUNT(DISTINCT gm.id) as total_members,
          COUNT(DISTINCT CASE WHEN gm.status = 'active' THEN gm.id END) as active_members,
          SUM(CASE WHEN c.status = 'completed' THEN c.amount ELSE 0 END)::DECIMAL as total_contributions,
          COUNT(DISTINCT CASE WHEN mc.id IS NOT NULL THEN mc.id END) as missed_contributions,
          COALESCE(SUM(rf.amount), 0)::DECIMAL as reserve_balance
         FROM groups g
         LEFT JOIN group_members gm ON g.id = gm.group_id
         LEFT JOIN contributions c ON g.id = c.group_id
         LEFT JOIN missed_contributions mc ON g.id = mc.group_id
         LEFT JOIN reserve_fund rf ON g.id = rf.group_id
         WHERE g.id = $1
         GROUP BY g.id, g.name, g.admin_id, g.monthly_contribution`,
        [groupId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching group stats:', error);
      throw new AppError('Failed to fetch group statistics', 500);
    }
  }
}

export default new GroupService();
