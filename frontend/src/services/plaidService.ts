import axios from 'axios';

const PLAID_CLIENT_ID = process.env.REACT_APP_PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.REACT_APP_PLAID_SECRET || '';
const PLAID_ENV = process.env.REACT_APP_PLAID_ENV || 'sandbox';
const PLAID_BASE_URL = `https://${PLAID_ENV}.plaid.com`;

interface LinkTokenRequest {
  user: { client_user_id: string };
  client_name: string;
  language: string;
  country_codes: string[];
  products: string[];
}

export const plaidService = {
  /**
   * Create Plaid Link token
   */
  createLinkToken: async (userId: string): Promise<string> => {
    try {
      const response = await axios.post(
        `${PLAID_BASE_URL}/link/token/create`,
        {
          user: { client_user_id: userId },
          client_name: 'Merry Go Round Chamaa',
          language: 'en',
          country_codes: ['KE'],
          products: ['auth', 'transactions'],
        },
        {
          auth: {
            username: PLAID_CLIENT_ID,
            password: PLAID_SECRET,
          },
        }
      );

      return response.data.link_token;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error_message || 'Failed to create Plaid link token'
      );
    }
  },

  /**
   * Exchange public token for access token
   */
  exchangePublicToken: async (publicToken: string): Promise<string> => {
    try {
      const response = await axios.post(
        `${PLAID_BASE_URL}/item/public_token/exchange`,
        {
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          public_token: publicToken,
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error_message || 'Failed to exchange public token'
      );
    }
  },

  /**
   * Get linked accounts
   */
  getAccounts: async (accessToken: string): Promise<any[]> => {
    try {
      const response = await axios.post(
        `${PLAID_BASE_URL}/accounts/get`,
        {
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          access_token: accessToken,
        }
      );

      return response.data.accounts;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error_message || 'Failed to fetch accounts'
      );
    }
  },

  /**
   * Get account balance
   */
  getBalance: async (accessToken: string, accountId: string): Promise<any> => {
    try {
      const response = await axios.post(
        `${PLAID_BASE_URL}/accounts/balance/get`,
        {
          client_id: PLAID_CLIENT_ID,
          secret: PLAID_SECRET,
          access_token: accessToken,
          options: { account_id: accountId },
        }
      );

      return response.data.accounts[0].balances;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error_message || 'Failed to fetch balance'
      );
    }
  },
};

export default plaidService;
