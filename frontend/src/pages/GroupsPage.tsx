import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyContribution: '',
    maxMembers: '100',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups');
      setGroups(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/groups', {
        ...formData,
        monthlyContribution: Number(formData.monthlyContribution),
        maxMembers: Number(formData.maxMembers),
      });
      toast.success('Group created successfully!');
      setFormData({ name: '', description: '', monthlyContribution: '', maxMembers: '100' });
      setShowCreateForm(false);
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
          <p className="text-gray-600">Manage your savings groups</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700"
        >
          + Create Group
        </button>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Group Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="px-4 py-3 rounded-lg border border-gray-300"
                required
              />
              <input
                type="number"
                placeholder="Monthly Contribution (KES)"
                value={formData.monthlyContribution}
                onChange={(e) => setFormData({...formData, monthlyContribution: e.target.value})}
                className="px-4 py-3 rounded-lg border border-gray-300"
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Create Group
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <p className="text-2xl mb-2">👥</p>
          <p className="text-gray-600 mb-4">No groups yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Monthly Contribution</p>
                  <p className="font-bold text-gray-900">KES {group.monthly_contribution}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Members</p>
                  <p className="font-bold text-gray-900">{group.current_members || 0}/{group.max_members}</p>
                </div>
              </div>
              <a href={`/groups/${group.id}`} className="w-full py-2 px-4 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 text-center transition-colors">
                View Details
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
