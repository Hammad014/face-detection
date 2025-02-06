

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (token && sessionExpiry) {
      const currentTime = Date.now();
      if (currentTime < parseInt(sessionExpiry, 10)) {
        return true;
      } else {
        // Session expired
        localStorage.clear();
        return false;
      }
    }
    return false;
  });

  // Function to handle logout
  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login');
  };

  useEffect(() => {
    const checkSession = () => {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        const currentTime = Date.now();
        if (currentTime >= expiryTime) {
          // Session has expired
          logout();
        } else {
          // Set timeout for the remaining time
          const remainingTime = expiryTime - currentTime;
          setTimeout(() => {
            logout();
          }, remainingTime);
        }
      }
    };

    checkSession();

    // Optionally, set an interval to regularly check the session
    const interval = setInterval(() => {
      checkSession();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
