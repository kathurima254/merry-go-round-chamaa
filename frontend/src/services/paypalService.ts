import axios from 'axios';

const PAYPAL_API = process.env.REACT_APP_PAYPAL_API || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.REACT_APP_PAYPAL_SECRET || '';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  userId: string;
}

interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{ rel: string; href: string; method: string }>;
}

export const paypalService = {
  /**
   * Get PayPal access token
   */
  getAccessToken: async (): Promise<string> => {
    try {
      const auth = Buffer.from(
        `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`
      ).toString('base64');

      const response = await axios.post(
        `${PAYPAL_API}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get PayPal access token');
    }
  },

  /**
   * Create PayPal order
   */
  createOrder: async (data: PaymentData): Promise<PayPalOrder> => {
    try {
      const token = await paypalService.getAccessToken();

      const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: data.currency || 'USD',
                value: data.amount.toString(),
              },
              description: data.description,
              custom_id: data.userId,
            },
          ],
          application_context: {
            return_url: `${window.location.origin}/payment/success`,
            cancel_url: `${window.location.origin}/payment/cancel`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create PayPal order'
      );
    }
  },

  /**
   * Capture PayPal order
   */
  captureOrder: async (orderId: string): Promise<any> => {
    try {
      const token = await paypalService.getAccessToken();

      const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to capture PayPal order'
      );
    }
  },
};

export default paypalService;
