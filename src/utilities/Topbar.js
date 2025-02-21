import React from 'react';
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Topbar = () => {
  // Get the user's role from localStorage
  const role = localStorage.getItem('role');

  // Determine the dashboard path based on the role
  let dashboardPath;

  if (role === 'admin') {
    dashboardPath = '/admin-dashboard';
  } else if (role === 'security_incharge') {
    dashboardPath = '/incharge-dashboard';
  } else {
    // If role is not set or unrecognized, redirect to login
    dashboardPath = '/login';
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="m-4">
          {/* Home link wrapped around the logo */}
          
            <img className="h-28 w-28" src="/face-trace-logo.png" alt="Logo" />
          
        </div>
        <div className="flex justify-end p-4 mr-5">
          <Link to={dashboardPath}>
            <button
              className="flex m-6 items-center text-white hover:bg-gray-600 border border-gray-400 rounded-3xl px-4 py-3"
              aria-label="Back to Dashboard"
            >
              {/* Icon for Small Devices */}
              <FaHome className="text-lg sm:hidden" />

              {/* Icon and Text for Larger Devices */}
              <FaArrowLeft className="text-lg hidden sm:inline" />
              <span className="ml-2 hidden sm:inline text-sm font-medium">
                Back to Dashboard
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
