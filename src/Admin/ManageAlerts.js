import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../ProtectedRoute';

// Import your Header and Sidebar
import Header from './Header';
import Sidebar from './Sidebar';

import {
  FaSearch,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const ManageAlerts = () => {
  // --------------------- SIDEBAR LOGIC ---------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // --------------------- ALERTS STATES ---------------------
  const [alerts, setAlerts] = useState([]);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Known-alerts toggle logic
  const [knownAlertsEnabled, setKnownAlertsEnabled] = useState(true);
  const [tempKnownAlertsEnabled, setTempKnownAlertsEnabled] = useState(true);
  const [isSettingLoading, setIsSettingLoading] = useState(false);
  const [showToggleConfirmation, setShowToggleConfirmation] = useState(false);
  const [toggleSetting, setToggleSetting] = useState(null); // 'enable' or 'disable'
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 10;

  // --------------------- Fetch Alerts & Settings ---------------------
  useEffect(() => {
    // Fetch alerts
    fetch('http://13.53.130.198:5000/alerts')
      .then((res) => res.json())
      .then((data) => {
        const parsedData = data.map((alert) => ({
          ...alert,
          additionalInfo:
            typeof alert.additionalInfo === 'string'
              ? JSON.parse(alert.additionalInfo)
              : alert.additionalInfo || {},
        }));
        setAlerts(parsedData);
      })
      .catch((error) => {
        console.error('Error fetching alerts:', error);
        setError('Error fetching alerts.');
      });

    // Fetch known alerts setting
    fetch('http://13.53.130.198:5000/settings/known_alerts_enabled')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.value) {
          const isEnabled = data.value === 'true';
          setKnownAlertsEnabled(isEnabled);
          setTempKnownAlertsEnabled(isEnabled); // Keep them in sync initially
        }
      })
      .catch((error) => {
        console.error('Error fetching settings:', error);
      });
  }, []);

  // --------------------- WebSocket for Real-Time Alerts ---------------------
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      console.log('New alert received via WebSocket:', alert);

      if (alert.additionalInfo && typeof alert.additionalInfo === 'string') {
        alert.additionalInfo = JSON.parse(alert.additionalInfo);
      }

      if (!alert.name || !alert.category) {
        console.warn('Alert missing name or category:', alert);
        return;
      }

      // If it's a known alert and known alerts are disabled, skip
      if (alert.category !== 'unknown' && !knownAlertsEnabled) {
        console.log('Known alerts are disabled. Ignoring this alert.');
        return;
      }

      // Prepend the new alert to the state
      setAlerts((prevAlerts) => [
        {
          id: prevAlerts.length + 1, // quick unique key
          ...alert,
        },
        ...prevAlerts,
      ]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => ws.close();
  }, [knownAlertsEnabled]);

  // --------------------- Toggle Alert Details ---------------------
  const toggleDetails = (id) => {
    setExpandedAlert(expandedAlert === id ? null : id);
  };

  // --------------------- Format Date/Time ---------------------
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      dateString: date.toLocaleDateString(),
      timeString: date.toLocaleTimeString(),
    };
  };

  // --------------------- Filtered Alerts ---------------------
  const filteredAlerts = alerts.filter((alert) => {
    const categoryLower = alert.category ? alert.category.toLowerCase() : '';
    const now = new Date();
    const alertDate = new Date(alert.timestamp);

    // Category filter
    let categoryMatch = false;
    if (filter === 'all') categoryMatch = true;
    else if (filter === 'unknown' && alert.name === 'Unknown') categoryMatch = true;
    else if (filter === 'known' && alert.name !== 'Unknown') categoryMatch = true;
    else if (filter === 'students' && categoryLower === 'student') categoryMatch = true;
    else if (filter === 'faculty' && categoryLower === 'faculty') categoryMatch = true;
    else if (filter === 'workers' && categoryLower === 'worker') categoryMatch = true;
    else if (
      filter === 'violated-students' &&
      (categoryLower === 'student' ||
        categoryLower === 'faculty' ||
        categoryLower === 'worker') &&
      alert.disciplineCase
    ) {
      categoryMatch = true;
    }

    // Date filter
    let dateMatch = false;
    if (dateFilter === 'all') dateMatch = true;
    else if (dateFilter === 'today') {
      dateMatch = alertDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      dateMatch = alertDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'lastWeek') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateMatch = alertDate >= oneWeekAgo && alertDate <= now;
    } else if (dateFilter === 'lastMonth') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateMatch = alertDate >= oneMonthAgo && alertDate <= now;
    }

    // Search filter
    const query = searchQuery.toLowerCase();
    const nameMatch = alert.name.toLowerCase().includes(query);
    const regNoMatch = alert.additionalInfo?.RegNo?.toLowerCase().includes(query);
    const facIdMatch = alert.additionalInfo?.FacultyId?.toLowerCase().includes(query);
    const workerIdMatch = alert.additionalInfo?.WorkerId?.toLowerCase().includes(query);
    const deptMatch = alert.additionalInfo?.Department?.toLowerCase().includes(query);
    const searchMatch = !searchQuery || nameMatch || regNoMatch || facIdMatch || workerIdMatch || deptMatch;

    return categoryMatch && dateMatch && searchMatch;
  });

  // --------------------- Pagination (4-page window) ---------------------
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);

  // Safely update current page
  const safeSetCurrentPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Slice alerts for the current page
  const indexOfLastAlert = currentPage * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlertsData = filteredAlerts.slice(indexOfFirstAlert, indexOfLastAlert);

  /**
   * Sliding window: show exactly 4 pages if possible.
   * E.g., if currentPage=1 => pages 1..4
   * if currentPage=2 => pages 2..5, etc.
   */
  let startPage = currentPage;
  let endPage = currentPage + 3;
  if (endPage > totalPages) endPage = totalPages;

  // If we don't have 4 pages in [startPage..endPage],
  // shift the startPage back just enough to make 4 total (if possible).
  if (endPage - startPage < 3) {
    startPage = endPage - 3;
  }
  if (startPage < 1) startPage = 1;

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // --------------------- Toggle Known Alerts Handler ---------------------
  const handleToggleChange = () => {
    const action = tempKnownAlertsEnabled ? 'disable' : 'enable';
    setToggleSetting(action);
    setTempKnownAlertsEnabled(!tempKnownAlertsEnabled);
    setShowToggleConfirmation(true);
  };

  const confirmToggleKnownAlerts = () => {
    setShowToggleConfirmation(false);
    setIsSettingLoading(true);

    const newValue = toggleSetting === 'disable' ? 'false' : 'true';

    fetch('http://13.53.130.198:5000/settings/known_alerts_enabled', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newValue }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || 'Failed to update setting.');
          });
        }
        return res.json();
      })
      .then(() => {
        // Keep them in sync
        const isNowEnabled = newValue === 'true';
        setKnownAlertsEnabled(isNowEnabled);
        setTempKnownAlertsEnabled(isNowEnabled);
        setMessage(
          `Known alerts ${toggleSetting === 'disable' ? 'disabled' : 'enabled'} successfully.`
        );
        setIsErrorMessage(false);
      })
      .catch((error) => {
        setMessage(error.message || 'Server error. Please try again later.');
        setIsErrorMessage(true);
        // Revert the toggle
        setTempKnownAlertsEnabled(knownAlertsEnabled);
      })
      .finally(() => {
        setIsSettingLoading(false);
      });
  };

  const cancelToggleKnownAlerts = () => {
    setShowToggleConfirmation(false);
    setTempKnownAlertsEnabled(knownAlertsEnabled);
  };

  // --------------------- RENDER ---------------------
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-800 text-black">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8">
            {/* SEARCH BAR */}
            <div className="relative max-w-3xl mx-auto mt-4">
              <FaSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Name, Reg No, ID, Department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              />
            </div>

            {/* DATE FILTERS */}
            <div className="mt-6">
              {/* Show 3 date filters on small screens */}
              <div className="flex flex-wrap justify-center space-x-2 space-y-2 sm:hidden">
                {['all', 'today', 'lastWeek'].map((df) => (
                  <button
                    key={df}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      dateFilter === df
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-indigo-500 hover:text-white'
                    }`}
                    onClick={() => setDateFilter(df)}
                  >
                    {df === 'all'
                      ? 'All'
                      : df === 'today'
                      ? 'Today'
                      : 'Last Week'}
                  </button>
                ))}
              </div>

              {/* Show all date filters on medium+ screens */}
              <div className="hidden sm:flex flex-wrap justify-center space-x-2 space-y-2">
                {['all', 'today', 'yesterday', 'lastWeek', 'lastMonth'].map((df) => (
                  <button
                    key={df}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      dateFilter === df
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-indigo-500 hover:text-white'
                    }`}
                    onClick={() => setDateFilter(df)}
                  >
                    {df === 'all'
                      ? 'All Dates'
                      : df === 'today'
                      ? 'Today'
                      : df === 'yesterday'
                      ? 'Yesterday'
                      : df === 'lastWeek'
                      ? 'Last Week'
                      : 'Last Month'}
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="mt-4">
              {/* Show 3 category filters on small screens */}
              <div className="flex flex-wrap justify-center space-x-2 space-y-2 sm:hidden">
                {['all', 'unknown', 'students'].map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                      filter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                    }`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat === 'all'
                      ? 'All'
                      : cat === 'unknown'
                      ? 'Unknown'
                      : 'Students'}
                  </button>
                ))}
              </div>

              {/* Show all category filters on medium+ screens */}
              <div className="hidden sm:flex flex-wrap justify-center space-x-2 space-y-2">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All Categories
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filter === 'unknown'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => setFilter('unknown')}
                >
                  Unknown
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filter === 'known'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => setFilter('known')}
                >
                  Known
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filter === 'students'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => setFilter('students')}
                >
                  Students
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filter === 'faculty'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => setFilter('faculty')}
                >
                  Faculty
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filter === 'workers'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => setFilter('workers')}
                >
                  Workers
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filter === 'violated-students'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                  }`}
                  onClick={() => setFilter('violated-students')}
                >
                  Violated Person
                </button>
              </div>
            </div>

            {/* Toggle Switch for Known Alerts */}
            <div className="flex justify-center mt-6">
              <label htmlFor="toggleKnownAlerts" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="toggleKnownAlerts"
                    className="sr-only"
                    checked={tempKnownAlertsEnabled}
                    onChange={handleToggleChange}
                  />
                  <div
                    className={`block w-16 h-8 rounded-full transition-colors duration-300 
                      ${tempKnownAlertsEnabled ? 'bg-green-500' : 'bg-red-500'}
                    `}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300 transform bg-white
                      ${tempKnownAlertsEnabled ? 'translate-x-8' : ''}
                    `}
                  ></div>
                  <div className="absolute left-2 top-2 text-[10px] font-bold text-white">
                    OFF
                  </div>
                  <div className="absolute right-2 top-2 text-[10px] font-bold text-white">
                    ON
                  </div>
                </div>
                <span className="ml-3 text-white font-semibold">Known Alerts</span>
              </label>
            </div>

            {/* Toggle Confirmation Modal */}
            {showToggleConfirmation && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-gray-700 p-8 rounded-lg shadow-lg max-w-md w-full">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-yellow-400" />
                    Confirm Action
                  </h3>
                  <p className="text-gray-300 mb-6">
                    If you {toggleSetting === 'disable' ? 'disable' : 'enable'} this setting, it
                    will{' '}
                    {toggleSetting === 'disable'
                      ? 'stop saving known alerts to the database.'
                      : 'start saving known alerts to the database.'}
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={cancelToggleKnownAlerts}
                      className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 flex items-center"
                    >
                      <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button
                      onClick={confirmToggleKnownAlerts}
                      className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 flex items-center"
                      disabled={isSettingLoading}
                    >
                      {isSettingLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          {toggleSetting === 'disable' ? 'Disabling...' : 'Enabling...'}
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" /> Confirm
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success/Error Message */}
            {message && (
              <div
                className={`mt-4 text-center text-lg font-semibold ${
                  isErrorMessage ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {message}
              </div>
            )}

            {/* Alerts List */}
            <div className="max-w-5xl bg-gray-700 mx-auto p-6 rounded-lg mt-8 shadow-xl text-white">
              <h2 className="text-3xl font-bold text-center mb-8">
                Manage Alerts ({filteredAlerts.length})
              </h2>

              {error && <p className="text-center text-red-600">{error}</p>}
              {currentAlertsData.length === 0 && !error && (
                <p className="text-center text-gray-300">No alerts found.</p>
              )}

              {currentAlertsData.map((alert) => {
                const { dateString, timeString } = formatDateTime(alert.timestamp);
                const categoryLower = alert.category?.toLowerCase() || '';
                const additionalInfo = alert.additionalInfo;

                // Color-coding the alert
                let alertColor = 'bg-green-700';
                if (categoryLower === 'unknown') {
                  alertColor = 'bg-red-700';
                } else if (alert.disciplineCase) {
                  alertColor = 'bg-yellow-600';
                }

                return (
                  <div
                    key={alert.id}
                    className={`p-6 mb-6 rounded-md shadow-lg transition-transform duration-300 ${alertColor}`}
                  >
                    {/* Discipline Case Badge */}
                    {alert.disciplineCase && (
                      <span className="inline-block bg-yellow-700 text-yellow-100 text-xs px-2 py-1 rounded-full mb-2">
                        {alert.disciplineCase}
                      </span>
                    )}

                    <div className="flex justify-between items-center">
                      <p className="font-bold">
                        {categoryLower === 'unknown'
                          ? 'Unknown Person Detected'
                          : alert.disciplineCase
                          ? `${capitalizeFirstLetter(alert.category)} with Discipline Case Detected`
                          : `${capitalizeFirstLetter(alert.category)} Detected`}
                      </p>
                      <button
                        className="text-blue-300 font-bold hover:text-blue-500 focus:outline-none transition-colors duration-300"
                        onClick={() => toggleDetails(alert.id)}
                      >
                        {expandedAlert === alert.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {/* Collapsible Info */}
                    <div
                      className={`mt-4 bg-gray-700 text-white p-4 rounded-lg shadow-inner transition-all duration-500 ease-in-out overflow-hidden ${
                        expandedAlert === alert.id
                          ? 'max-h-screen opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      {expandedAlert === alert.id && (
                        <div className="flex flex-col space-y-4">
                          {/* UNKNOWN + image */}
                          {categoryLower === 'unknown' &&
                            additionalInfo?.image_path && (
                              <>
                                <p>
                                  <strong>Time of Detection:</strong> {timeString}
                                </p>
                                <p>
                                  <strong>Date of Detection:</strong> {dateString}
                                </p>
                                <img
                                  src={`http://localhost:5000${additionalInfo.image_path}`}
                                  alt="Unknown Person"
                                  className="mt-4 rounded-lg shadow-md w-full h-auto max-w-sm"
                                />
                              </>
                            )}

                          {/* STUDENT */}
                          {categoryLower === 'student' && (
                            <div className="space-y-2">
                              <p>
                                <strong>Name:</strong> {alert.name}
                              </p>
                              <p>
                                <strong>Reg No:</strong> {additionalInfo?.RegNo || 'N/A'}
                              </p>
                              <p>
                                <strong>Department:</strong> {additionalInfo?.Department || 'N/A'}
                              </p>
                              {alert.disciplineCase && (
                                <p className="text-yellow-400">
                                  <strong>Discipline Case:</strong> {alert.disciplineCase}
                                </p>
                              )}
                              <p>
                                <strong>Time of Detection:</strong> {timeString}
                              </p>
                              <p>
                                <strong>Date of Detection:</strong> {dateString}
                              </p>
                            </div>
                          )}

                          {/* FACULTY */}
                          {categoryLower === 'faculty' && (
                            <div className="space-y-2">
                              <p>
                                <strong>Name:</strong> {alert.name}
                              </p>
                              <p>
                                <strong>Faculty ID:</strong> {additionalInfo?.FacultyId || 'N/A'}
                              </p>
                              <p>
                                <strong>Department:</strong> {additionalInfo?.Department || 'N/A'}
                              </p>
                              {alert.disciplineCase && (
                                <p className="text-yellow-300">
                                  <strong>Discipline Case:</strong> {alert.disciplineCase}
                                </p>
                              )}
                              <p>
                                <strong>Time of Detection:</strong> {timeString}
                              </p>
                              <p>
                                <strong>Date of Detection:</strong> {dateString}
                              </p>
                            </div>
                          )}

                          {/* WORKER */}
                          {categoryLower === 'worker' && (
                            <div className="space-y-2">
                              <p>
                                <strong>Name:</strong> {alert.name}
                              </p>
                              <p>
                                <strong>Worker ID:</strong> {additionalInfo?.WorkerId || 'N/A'}
                              </p>
                              {alert.disciplineCase && (
                                <p className="text-yellow-300">
                                  <strong>Discipline Case:</strong> {alert.disciplineCase}
                                </p>
                              )}
                              <p>
                                <strong>Time of Detection:</strong> {timeString}
                              </p>
                              <p>
                                <strong>Date of Detection:</strong> {dateString}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-1">
                  {/* Prev */}
                  <button
                    onClick={() => safeSetCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>

                  {/* Page numbers (up to 4) */}
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => safeSetCurrentPage(page)}
                      className={`px-3 py-2 rounded-md font-medium ${
                        currentPage === page
                          ? 'bg-blue-800 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    onClick={() => safeSetCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Helper: Capitalize the first letter
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default ManageAlerts;
