import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user?.role !== 'super_admin') {
      return;
    }
    fetchAdminStats();
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform statistics and controls</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Groups</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_groups}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Platform Volume</p>
            <p className="text-3xl font-bold text-gray-900">KES {(stats.total_volume || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium mb-2">Reserve Balance</p>
            <p className="text-3xl font-bold text-gray-900">KES {(stats.reserve_balance || 0).toLocaleString()}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPage;
