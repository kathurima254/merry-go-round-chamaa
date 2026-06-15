import { Router, Request, Response } from 'express';
import { query, transaction } from '../database/connection';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const router = Router();

router.use(authenticate);

const createGroupSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  maxMembers: Joi.number().min(2).max(1000),
  monthlyContribution: Joi.number().positive().required(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new AppError('User not authenticated', 401);

    const { error, value } = createGroupSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const groupId = uuidv4();

    await transaction(async (client) => {
      await client.query(
        `INSERT INTO groups (id, name, description, admin_id, monthly_contribution, max_members, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [groupId, value.name, value.description, req.user!.id, value.monthlyContribution, value.maxMembers || 100]
      );

      await client.query(
        `INSERT INTO group_members (id, group_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, 'admin', NOW())`,
        [uuidv4(), groupId, req.user!.id]
      );
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { id: groupId },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create group', 500);
  }
});

export default router;
