// ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Get the user's role from localStorage
  console.log(userRole);


  if (!token) {
    // User is not authenticated
    return <Navigate to="/login" />;
  }

  if (roles && roles.length > 0 && !roles.includes(userRole)) {
    // User does not have the required role
    return <Navigate to="/unauthorized" />;
  }

  // User is authenticated and has the required role
  return children;
};

export default ProtectedRoute;
