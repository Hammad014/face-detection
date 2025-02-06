// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Tooltip from './Tooltip';

const BEEP_SOUND_URL = '/beep.mp3';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [realTimeNotification, setRealTimeNotification] = useState([]);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const role = localStorage.getItem('role'); // Get user role

  // Ask for notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) =>
        console.log('Notification permission status:', permission)
      );
    }
  }, []);

  // Play beep sound
  const playBeep = () => {
    const audio = new Audio(BEEP_SOUND_URL);
    audio.play().catch((error) => console.log('Error playing sound:', error));
  };

  // WebSocket connection for real-time alerts (example port: 8080)
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      console.log('New alert received:', newAlert);

      // Only show alert if it's an "Unknown" person
      if (newAlert.name === 'Unknown') {
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const notificationOptions = {
            body: 'An unknown person has been detected.',
            icon: '/face-trace-logo.png',
          };
          new Notification('Unknown Person Detected', notificationOptions);
        }

        // Attempt to play beep sound
        playBeep();

        // Update local notifications state (limit to 5)
        setRealTimeNotification((prevNotifications) => {
          const updated = [...prevNotifications, newAlert];
          if (updated.length > 5) updated.shift();
          return updated;
        });
      }
    };

    ws.onclose = () => console.log('WebSocket closed');

    // Cleanup on unmount
    return () => ws.close();
  }, []);

  // Close notifications if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clicking on a notification navigates to manage alerts
  const handleNotificationClick = () => {
    setShowNotifications(false);
    navigate('/admin-dashboard/manage-alerts');
  };

  // Bell icon click (toggle notifications)
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    // Clear the red badge once we open the dropdown
    if (showNotifications) setRealTimeNotification([]);
  };

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
   <header className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 md:p-6 shadow-xl flex flex-col md:flex-row justify-between items-center top-0 z-50">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 md:h-16 md:w-16 transition-transform duration-300 hover:scale-105">
            <img
              src="/face-trace-logo.png"
              alt="Logo"
              className="object-contain h-full w-full drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {role === 'admin' ? 'Admin Dashboard' : 'Security Incharge Dashboard'}
          </h1>
        </div>

        <div className="md:hidden relative group">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-300"
          >
            {isSidebarOpen ? (
              <FaTimes className="text-white text-xl" />
            ) : (
              <FaBars className="text-white text-xl" />
            )}
          </button>
          <Tooltip text={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'} />
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-4 md:mt-0 w-full justify-end">
        <div className="relative group" ref={notificationsRef}>
          <div className="relative">
            <FaBell
              className="text-white text-2xl cursor-pointer hover:text-blue-400 transition-colors duration-200"
              onClick={handleBellClick}
            />
            {realTimeNotification.length > 0 && !showNotifications && (
              <span className="absolute -top-1 -right-2 bg-red-500 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold text-white animate-pulse">
                {realTimeNotification.length}
              </span>
            )}
          </div>
          <Tooltip text="Notifications" />

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-gray-800 backdrop-blur-lg border border-gray-700 text-white shadow-2xl rounded-xl overflow-hidden z-50 transform transition-all duration-300 origin-top">
              <div className="p-2 bg-gray-900 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-blue-400">Recent Alerts</h3>
              </div>
              {realTimeNotification.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-4 hover:bg-gray-700/50 cursor-pointer border-b border-gray-700/30 last:border-b-0 transition-colors duration-200"
                  onClick={handleNotificationClick}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-medium">Unknown Person Detected</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {realTimeNotification.length === 0 && (
                <div className="p-4 text-sm text-gray-400">No new notifications</div>
              )}
            </div>
          )}
        </div>

        <button
          className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
          onClick={handleSignOut}
        >
          <FaSignOutAlt className="text-lg" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
