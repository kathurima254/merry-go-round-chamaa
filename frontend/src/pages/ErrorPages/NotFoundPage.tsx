import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
