import React from 'react';
import { useNavigate } from 'react-router-dom';

const NetworkErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">📋</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Internet Connection</h2>
        <p className="text-gray-600 mb-8">Please check your internet connection and try again.</p>
        <button
          onClick={() => location.reload()}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default NetworkErrorPage;
