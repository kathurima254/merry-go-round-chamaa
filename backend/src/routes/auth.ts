import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { query } from '../database/connection';
import { AppError } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(8).required(),
  idNumber: Joi.string().required(),
});

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { firstName, lastName, email, phone, password, idNumber } = value;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, id_number, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'member', NOW())
       RETURNING id, email, first_name, last_name, role`,
      [firstName, lastName, email, phone, hashedPassword, idNumber]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );

    logger.info(`User registered: ${user.id}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Registration error:', error);
    throw new AppError('Registration failed', 500);
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400, 'VALIDATION_ERROR');
    }

    const { email, password } = value;

    // Get user
    const userResult = await query(
      'SELECT id, email, password_hash, role, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${user.id}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Login error:', error);
    throw new AppError('Login failed', 500);
  }
});

router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as { id: string };

    const userResult = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = userResult.rows[0];

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Token refresh failed', 401);
  }
});

export default router;
