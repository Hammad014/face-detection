// Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserPlus, FaUserEdit, FaUserTimes, FaExclamationTriangle, FaUserCheck, FaGavel } from 'react-icons/fa';
import Tooltip from './Tooltip';

const Sidebar = ({ isSidebarOpen, closeSidebar }) => {
  const location = useLocation();
  const role = localStorage.getItem('role');
  const isActive = (path) => location.pathname === path;
  
  // Base path based on role
  const basePath = role === 'admin' ? '/admin-dashboard' : '/incharge-dashboard';

  // Common menu items
  const commonItems = [
    { path: basePath, icon: <FaHome />, text: 'Home', tooltip: 'Dashboard Home' },
    { path: `${basePath}/manage-alerts`, icon: <FaExclamationTriangle />, text: 'View Alerts', tooltip: 'Review alerts' },
  ];

  // Admin-specific items
  const adminItems = [
    { path: `${basePath}/register-user`, icon: <FaUserPlus />, text: 'Register Person', tooltip: 'Register new person' },
    { path: `${basePath}/update-person`, icon: <FaUserEdit />, text: 'Update Person', tooltip: 'Update details' },
    { path: `${basePath}/delete-person`, icon: <FaUserTimes />, text: 'Delete Person', tooltip: 'Remove person' },
    { path: `${basePath}/manage-attendance`, icon: <FaUserCheck />, text: 'Attendance', tooltip: 'Track attendance' },
    { path: `${basePath}/discipline-cases`, icon: <FaGavel />, text: 'Violations', tooltip: 'Discipline cases' },
  ];

  // Security Incharge-specific items
  const inchargeItems = [
    { path: `${basePath}/discipline-cases`, icon: <FaGavel />, text: 'Violations', tooltip: 'Discipline cases' },
    { path: `${basePath}/action`, icon: <FaGavel />, text: 'Action', tooltip: 'Take suitable action' },
  ];

  const menuItems = [
    ...commonItems,
    ...(role === 'admin' ? adminItems : inchargeItems)
  ];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-64 md:static text-white p-6 space-y-6 transition-all duration-300 bg-gray-900 z-50 shadow-2xl border-r border-gray-800`}
      >
        <nav>
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600/30 border border-blue-500/50 text-blue-400'
                      : 'hover:bg-gray-800/50 hover:border-gray-700/50 border border-transparent'
                  }`}
                  onClick={closeSidebar}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.text}</span>
                </Link>
                <Tooltip text={item.tooltip} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;