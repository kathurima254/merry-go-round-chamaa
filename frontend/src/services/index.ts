import api from './api';
import { User, Withdrawal } from '../types';

export const walletService = {
  getBalance: async (): Promise<number> => {
    const response = await api.get('/wallet/balance');
    return response.data.data.balance;
  },

  getTransactionHistory: async (
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> => {
    const response = await api.get('/transactions/history', {
      params: { limit, offset },
    });
    return response.data.data;
  },

  withdraw: async (
    amount: number,
    type: 'instant' | 'chamaa',
    phone: string
  ): Promise<Withdrawal> => {
    const response = await api.post('/wallet/withdraw', {
      amount,
      type,
      phone,
    });
    return response.data.data;
  },

  getWithdrawalStatus: async (withdrawalId: string): Promise<Withdrawal> => {
    const response = await api.get(`/wallet/withdrawals/${withdrawalId}`);
    return response.data.data;
  },
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    idNumber: string
  ) => {
    const response = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      phone,
      password,
      idNumber,
    });
    return response.data.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data.data;
  },
};

export const groupService = {
  getGroups: async (): Promise<any[]> => {
    const response = await api.get('/groups');
    return response.data.data;
  },

  createGroup: async (
    name: string,
    description: string,
    monthlyContribution: number,
    maxMembers?: number
  ) => {
    const response = await api.post('/groups', {
      name,
      description,
      monthlyContribution,
      maxMembers,
    });
    return response.data.data;
  },

  getGroupStats: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}/stats`);
    return response.data.data;
  },

  addMember: async (groupId: string, userId: string) => {
    const response = await api.post(`/groups/${groupId}/members`, { userId });
    return response.data.data;
  },
};

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  getAuditLogs: async (limit: number = 100, offset: number = 0) => {
    const response = await api.get('/admin/audit-logs', {
      params: { limit, offset },
    });
    return response.data.data;
  },
};
