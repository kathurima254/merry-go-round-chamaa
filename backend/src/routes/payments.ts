import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { query, transaction } from '../database/connection';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import walletService from '../services/walletService';

const router = Router();

/**
 * M-Pesa STK Push Callback
 */
router.post('/mpesa/callback', async (req: Request, res: Response) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    logger.info('M-Pesa Callback received:', stkCallback);

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find((item: any) => item.Name === 'Amount').Value;
      const mpesaCode = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber').Value;
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber').Value;

      await transaction(async (client) => {
        // Find withdrawal by phone
        const withdrawalResult = await client.query(
          `SELECT id, user_id FROM withdrawals 
           WHERE phone = $1 AND status = 'pending' 
           ORDER BY requested_at DESC LIMIT 1`,
          [phoneNumber.toString()]
        );

        if (withdrawalResult.rows.length > 0) {
          const withdrawal = withdrawalResult.rows[0];

          // Update withdrawal status
          await client.query(
            `UPDATE withdrawals SET status = 'completed', 
             transaction_ref = $1, processed_at = NOW() 
             WHERE id = $2`,
            [mpesaCode, withdrawal.id]
          );

          // Log audit
          await client.query(
            `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, status, created_at)
             VALUES ($1, $2, 'PAYMENT_SUCCESS', 'withdrawal', $3, $4, 'success', NOW())`,
            [uuidv4(), withdrawal.user_id, withdrawal.id, JSON.stringify({ mpesaCode, amount })]
          );
        }
      });
    } else {
      // Payment failed
      logger.warn('M-Pesa Payment failed:', stkCallback.ResultDesc);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Callback received' });
  } catch (error) {
    logger.error('M-Pesa callback error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
});

/**
 * B2C Payment Callback
 */
router.post('/mpesa/result', async (req: Request, res: Response) => {
  try {
    const { Result } = req.body;

    logger.info('M-Pesa B2C Result:', Result);

    if (Result.ResultCode === 0) {
      // B2C successful
      const transactionRef = Result.TransactionID;

      await query(
        `UPDATE withdrawals SET status = 'completed', 
         transaction_ref = $1, processed_at = NOW() 
         WHERE id = $2`,
        [transactionRef, Result.ConversationID]
      );
    }

    res.json({ status: 'success' });
  } catch (error) {
    logger.error('B2C result error:', error);
    res.status(500).json({ status: 'error' });
  }
});

/**
 * PayPal Webhook
 */
router.post('/paypal/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;

    if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
      const orderId = event.resource.id;
      const amount = parseFloat(event.resource.purchase_units[0].amount.value);
      const customId = event.resource.purchase_units[0].custom_id;

      // Add funds to wallet
      await walletService.recordTransaction(
        customId,
        amount,
        'deposit',
        `PayPal deposit: ${orderId}`,
        orderId
      );

      logger.info('PayPal payment processed:', { orderId, amount, userId: customId });
    }

    res.json({ status: 'success' });
  } catch (error) {
    logger.error('PayPal webhook error:', error);
    res.status(500).json({ status: 'error' });
  }
});

/**
 * Plaid Webhook
 */
router.post('/plaid/webhook', async (req: Request, res: Response) => {
  try {
    const { webhook_type, webhook_code, item_id } = req.body;

    logger.info('Plaid webhook:', { webhook_type, webhook_code, item_id });

    if (webhook_code === 'ITEM_LOGIN_REQUIRED') {
      // User needs to re-authenticate
      await query(
        `UPDATE linked_accounts SET status = 'requires_auth' WHERE item_id = $1`,
        [item_id]
      );
    }

    if (webhook_code === 'SYNC_UPDATES_AVAILABLE') {
      // New transactions available
      logger.info('New transactions available for sync');
    }

    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Plaid webhook error:', error);
    res.status(500).json({ status: 'error' });
  }
});

export default router;
