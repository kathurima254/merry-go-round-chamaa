import request from 'supertest';
import app from '../src/index';
import { query } from '../src/database/connection';

describe('Authentication', () => {
  beforeEach(async () => {
    // Clear users table
    await query('TRUNCATE TABLE users CASCADE');
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0712345678',
          password: 'SecurePassword123',
          idNumber: '12345678',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0712345678',
          password: 'SecurePassword123',
          idNumber: '12345678',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0712345679',
          password: 'SecurePassword123',
          idNumber: '87654321',
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('USER_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0712345678',
          password: 'SecurePassword123',
          idNumber: '12345678',
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecurePassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0712345678',
          password: 'SecurePassword123',
          idNumber: '12345678',
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
