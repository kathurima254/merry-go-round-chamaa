import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Server Error</h2>
        <p className="text-gray-600 mb-8">Something went wrong on our end. Our team has been notified and is working on it.</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => location.reload()}
            className="border-2 border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-lg hover:border-gray-400 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
