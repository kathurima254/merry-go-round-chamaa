import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../services/api';
import { RootState } from '../store';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';

const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/users/profile');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600">Here's what's happening with your account today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Wallet Balance"
          value={`KES ${stats?.wallet_balance?.toLocaleString() || '0'}`}
          icon="💰"
          trend="+5.2%"
          color="green"
        />
        <StatCard
          title="Total Contributions"
          value={`KES ${stats?.total_contributions?.toLocaleString() || '0'}`}
          icon="📊"
          trend="+12.5%"
          color="blue"
        />
        <StatCard
          title="Active Groups"
          value="3"
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Reserve Fund"
          value={`KES ${stats?.reserve_balance?.toLocaleString() || '0'}`}
          icon="🏦"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/wallet"
              className="block w-full py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors text-center"
            >
              💳 View Wallet
            </a>
            <a
              href="/withdraw"
              className="block w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors text-center"
            >
              💸 Withdraw Funds
            </a>
            <a
              href="/groups"
              className="block w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-lg transition-colors text-center"
            >
              👥 Manage Groups
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
