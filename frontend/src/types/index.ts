export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  role: 'super_admin' | 'group_admin' | 'member';
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  type: 'instant' | 'chamaa';
  tax: number;
  penalty: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  phone: string;
  requestedAt: string;
  processedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  adminId: string;
  monthlyContribution: number;
  maxMembers: number;
  currentMembers: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  code?: string;
}
