import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const WithdrawPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'instant',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [withdrawalResult, setWithdrawalResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/wallet/withdraw', {
        amount: Number(formData.amount),
        type: formData.type,
        phone: formData.phone,
      });

      setWithdrawalResult(response.data.data);
      toast.success('Withdrawal initiated successfully!');
      setFormData({ amount: '', type: 'instant', phone: '' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Withdrawal failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdraw Funds</h1>
        <p className="text-gray-600">Withdraw your balance instantly or through Chamaa fund</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Withdrawal Info */}
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">💳 Instant Withdrawal</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Processing Time: Instant</li>
              <li>✓ Tax: 1%</li>
              <li>✓ Available anytime</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">⏰ Chamaa Fund</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Processing Time: Up to 24hrs</li>
              <li>✓ Penalty: 10%</li>
              <li>✓ Disrupts cycle</li>
            </ul>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (KES)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.amount
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                disabled={loading}
              >
                <option value="instant">Instant (1% tax)</option>
                <option value="chamaa">Chamaa Fund (10% penalty)</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Processing...' : 'Withdraw Now'}
            </button>
          </form>
        </div>
      </div>

      {/* Result */}
      {withdrawalResult && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-6 text-center">
          <p className="text-3xl mb-2">✓</p>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Withdrawal Initiated</h3>
          <p className="text-green-800 text-sm">Your withdrawal is being processed. You'll receive an M-Pesa prompt shortly.</p>
        </div>
      )}
    </div>
  );
};

export default WithdrawPage;
