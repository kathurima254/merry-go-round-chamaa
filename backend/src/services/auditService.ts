import { query } from '../database/connection';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AuditService {
  async logAction(
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    oldValues: any = null,
    newValues: any = null,
    ipAddress?: string,
    userAgent?: string,
    status: string = 'success'
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO audit_logs 
         (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [
          uuidv4(),
          userId,
          action,
          entityType,
          entityId,
          JSON.stringify(oldValues),
          JSON.stringify(newValues),
          ipAddress,
          userAgent,
          status,
        ]
      );
    } catch (error) {
      logger.error('Error logging audit action:', error);
    }
  }

  async getUserAuditLog(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any> {
    try {
      const result = await query(
        `SELECT * FROM audit_logs WHERE user_id = $1 
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching audit log:', error);
      return [];
    }
  }
}

export default new AuditService();
