// src/NotFound.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Not Found</h1>
      <p className="mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="text-blue-500 hover:underline">Go to Home</Link>
    </div>
  );
};

export default NotFound;
