# Mobile Money & Bank Integration Guide

## M-Pesa Integration

### Setup

1. **Register with Safaricom**
   - Visit: https://developer.safaricom.co.ke
   - Create account and app
   - Get Consumer Key & Secret

2. **Environment Variables**
   ```
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_SHORTCODE=123456
   MPESA_PASSKEY=your_passkey
   MPESA_ENVIRONMENT=sandbox # or production
   ```

3. **Webhook Setup**
   - Set callback URL in Safaricom dashboard
   - Configure timeout URL
   - Enable IP whitelisting

### Payment Flow

```
User → STK Push → M-Pesa Popup → User Confirms → Callback → Database Update
```

### Code Examples

**Initiate Payment:**
```typescript
import { mpesaService } from './services/mpesaService';

const response = await mpesaService.initiateSTKPush({
  phoneNumber: '0712345678',
  amount: 500,
  accountReference: 'CHAMAA-12345',
  transactionDescription: 'Group contribution',
});
```

**Check Status:**
```typescript
const status = await mpesaService.checkSTKStatus(response.CheckoutRequestID);
```

## PayPal Integration

### Setup

1. **Create PayPal Developer Account**
   - Visit: https://developer.paypal.com
   - Create app (Merchant)

2. **Environment Variables**
   ```
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_SECRET=your_secret
   PAYPAL_MODE=sandbox # or live
   ```

3. **Webhook Configuration**
   - Setup endpoint in PayPal dashboard
   - Subscribe to payment events

### Payment Flow

```
User → Create Order → Redirect to PayPal → Confirm → Callback → Add Funds
```

### Code Examples

**Create Order:**
```typescript
const order = await paypalService.createOrder({
  amount: 100,
  currency: 'USD',
  description: 'Chamaa deposit',
  userId: user.id,
});

window.location.href = order.links.find(l => l.rel === 'approve').href;
```

**Capture Order:**
```typescript
const result = await paypalService.captureOrder(orderId);
```

## Bank Integration via Plaid

### Setup

1. **Create Plaid Account**
   - Visit: https://plaid.com
   - Get API keys

2. **Environment Variables**
   ```
   PLAID_CLIENT_ID=your_id
   PLAID_SECRET=your_secret
   PLAID_ENV=sandbox # or production
   ```

3. **Frontend Setup**
   ```bash
   npm install plaid-link
   ```

### Bank Connection Flow

```
User → Plaid Link → Select Bank → Login → Confirm → Store Token → Sync Transactions
```

### Code Examples

**Connect Bank Account:**
```typescript
const linkToken = await plaidService.createLinkToken(userId);
// Use Plaid Link with linkToken
```

**Get Account Balance:**
```typescript
const balance = await plaidService.getBalance(accessToken, accountId);
```

## Security Best Practices

### Encryption
```typescript
import crypto from 'crypto';

const encrypt = (text: string, key: string) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
};

const decrypt = (encrypted: string, key: string) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};
```

### Token Storage
- Never store sensitive tokens in localStorage
- Use httpOnly cookies for session tokens
- Encrypt tokens at rest

### PCI DSS Compliance
- No direct card storage
- Use tokenization
- Encrypt all data in transit (TLS 1.3)
- Log all access attempts

## Error Handling

```typescript
try {
  const result = await mpesaService.initiateSTKPush(...);
} catch (error: any) {
  if (error.message.includes('Invalid phone')) {
    // Handle invalid phone
  } else if (error.message.includes('Timeout')) {
    // Handle timeout - retry logic
  } else {
    // Log and notify
  }
}
```

## Payment Reconciliation

```typescript
// Sync pending payments
const pendingPayments = await query(
  `SELECT * FROM withdrawals WHERE status = 'pending' 
   AND requested_at < NOW() - INTERVAL '1 hour'`
);

for (const payment of pendingPayments) {
  const status = await mpesaService.checkSTKStatus(payment.checkout_id);
  // Update payment status
}
```

## Testing Payment Flows

### M-Pesa Test Credentials
- Phone: 254708374149
- Amount: Any amount (sandbox)

### PayPal Test Accounts
- Buyer: sb-test@paypal.com
- Password: Provided in dashboard

### Plaid Sandbox
- Use Plaid's test credentials
- Automatic success/failure responses

## Monitoring & Alerts

```typescript
// Alert on failed payments
logger.warn('Payment failed', {
  withdrawalId: payment.id,
  amount: payment.amount,
  error: error.message,
});

// Monitor transaction success rate
const successRate = (successful / total) * 100;
if (successRate < 95) {
  sendAlert('Payment success rate below threshold');
}
```

## Rate Limiting

```typescript
// Max 5 payment attempts per minute
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
});
```
