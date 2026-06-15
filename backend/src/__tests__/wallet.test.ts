import request from 'supertest';
import app from '../src/index';
import { query } from '../src/database/connection';

describe('Wallet', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        phone: '0712345678',
        password: 'TestPassword123',
        idNumber: '12345678',
      });

    token = registerResponse.body.data.accessToken;
    userId = registerResponse.body.data.user.id;

    // Add funds to wallet
    await query(
      `INSERT INTO wallet (id, user_id, amount, type, description, created_at)
       VALUES ($1, $2, 10000, 'deposit', 'Test deposit', NOW())`,
      [require('uuid').v4(), userId]
    );
  });

  describe('GET /api/wallet/balance', () => {
    it('should get wallet balance', async () => {
      const response = await request(app)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.balance).toBe(10000);
    });
  });

  describe('POST /api/wallet/withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const response = await request(app)
        .post('/api/wallet/withdraw')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 1000,
          type: 'instant',
          phone: '0712345678',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail with insufficient balance', async () => {
      const response = await request(app)
        .post('/api/wallet/withdraw')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 50000,
          type: 'instant',
          phone: '0712345678',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INSUFFICIENT_BALANCE');
    });
  });
});
