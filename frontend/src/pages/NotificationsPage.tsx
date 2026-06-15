import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications?type=${filter}`);
      setNotifications(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
    };
    return icons[type] || 'ℹ️';
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your account activity</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'unread', 'info', 'warning', 'error'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === type
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <p className="text-2xl mb-2">🔕</p>
          <p className="text-gray-600">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                notif.read
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-green-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getIcon(notif.type)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                  <p className="text-gray-600 text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
