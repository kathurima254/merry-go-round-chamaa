import axios from 'axios';
import CryptoJS from 'crypto-js';

const MPESA_BASE_URL = process.env.REACT_APP_MPESA_URL || 'https://sandbox.safaricom.co.ke';
const MPESA_CONSUMER_KEY = process.env.REACT_APP_MPESA_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.REACT_APP_MPESA_SECRET || '';
const MPESA_SHORTCODE = process.env.REACT_APP_MPESA_SHORTCODE || '';
const MPESA_PASSKEY = process.env.REACT_APP_MPESA_PASSKEY || '';

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDescription: string;
}

interface MpesaResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
}

export const mpesaService = {
  /**
   * Get OAuth token for M-Pesa API
   */
  getAccessToken: async (): Promise<string> => {
    try {
      const auth = Buffer.from(
        `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
      ).toString('base64');

      const response = await axios.get(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get M-Pesa access token');
    }
  },

  /**
   * Initiate STK Push (Lipa na M-Pesa Online)
   */
  initiateSTKPush: async (data: STKPushRequest): Promise<MpesaResponse> => {
    try {
      const token = await mpesaService.getAccessToken();
      const timestamp = new Date()
        .toISOString()
        .replace(/[^\d]/g, '')
        .slice(0, 14);

      const password = Buffer.from(
        `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      const payload = {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(data.amount),
        PartyA: `254${data.phoneNumber.slice(-9)}`,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: `254${data.phoneNumber.slice(-9)}`,
        CallBackURL: `${process.env.REACT_APP_API_URL}/payments/mpesa/callback`,
        AccountReference: data.accountReference,
        TransactionDesc: data.transactionDescription,
      };

      const response = await axios.post(
        `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        payload,
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
        error.response?.data?.errorMessage || 'STK Push failed'
      );
    }
  },

  /**
   * Check STK Push status
   */
  checkSTKStatus: async (
    checkoutRequestId: string
  ): Promise<{ resultCode: string; resultDesc: string }> => {
    try {
      const token = await mpesaService.getAccessToken();
      const timestamp = new Date()
        .toISOString()
        .replace(/[^\d]/g, '')
        .slice(0, 14);

      const password = Buffer.from(
        `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      const response = await axios.post(
        `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.errorMessage || 'Status check failed');
    }
  },

  /**
   * B2C Payment (Pay out to user)
   */
  b2cPayment: async (phoneNumber: string, amount: number, remarks: string) => {
    try {
      const token = await mpesaService.getAccessToken();

      const response = await axios.post(
        `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
        {
          InitiatorName: 'Chamaa',
          SecurityCredential: process.env.REACT_APP_MPESA_SECURITY_CREDENTIAL,
          CommandID: 'BusinessPayment',
          Amount: Math.floor(amount),
          PartyA: MPESA_SHORTCODE,
          PartyB: `254${phoneNumber.slice(-9)}`,
          Remarks: remarks,
          QueueTimeOutURL: `${process.env.REACT_APP_API_URL}/payments/mpesa/timeout`,
          ResultURL: `${process.env.REACT_APP_API_URL}/payments/mpesa/result`,
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
      throw new Error(error.response?.data?.errorMessage || 'B2C payment failed');
    }
  },
};

export default mpesaService;
