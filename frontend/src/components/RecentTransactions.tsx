import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/history?limit=10');
      setTransactions(response.data.data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'contribution': '📥',
      'withdrawal': '📤',
      'penalty': '⚠️',
      'deposit': '💳',
      'refund': '↩️',
    };
    return icons[type] || '💰';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'contribution': 'blue',
      'withdrawal': 'green',
      'penalty': 'red',
      'deposit': 'green',
      'refund': 'yellow',
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(tx.type)}</span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                  <p className="text-xs text-gray-500">{
                    new Date(tx.created_at).toLocaleDateString()
                  }</p>
                </div>
              </div>
              <p className={`font-semibold ${
                tx.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {tx.amount > 0 ? '+' : ''} KES {Math.abs(tx.amount).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
