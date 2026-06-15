import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const WalletPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  React.useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const profileResponse = await api.get('/users/profile');
      setBalance(profileResponse.data.data.wallet_balance);

      const txResponse = await api.get('/transactions/history?limit=100');
      setTransactions(txResponse.data.data);
    } catch (error: any) {
      toast.error('Failed to load wallet data');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
        <p className="text-gray-600">View your balance and transaction history</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
        <p className="text-green-100 mb-2">Available Balance</p>
        <h2 className="text-4xl font-bold mb-4">KES {balance.toLocaleString()}</h2>
        <div className="flex gap-4">
          <a href="/withdraw" className="bg-white text-green-600 font-semibold px-6 py-2 rounded-lg hover:bg-green-50 transition-colors">
            Withdraw
          </a>
          <button className="border-2 border-white text-white font-semibold px-6 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
            Transfer
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-xl">{getTypeIcon(tx.type)}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{tx.description || tx.type}</td>
                    <td className={`py-3 px-4 font-semibold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''} KES {Math.abs(tx.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
