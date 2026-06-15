export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  role: 'super_admin' | 'group_admin' | 'member';
  twoFaEnabled: boolean;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  adminId: string;
  monthlyContribution: number;
  maxMembers: number;
  currentMembers: number;
  status: 'active' | 'suspended' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  contributionCount: number;
  missedContributions: number;
  status: 'active' | 'suspended' | 'removed';
  joinedAt: Date;
}

export interface Contribution {
  id: string;
  userId: string;
  groupId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  dueDate: Date;
  paidDate: Date | null;
  createdAt: Date;
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
  requestedAt: Date;
  processedAt: Date | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}
