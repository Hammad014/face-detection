import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import Header from './Header';
import Sidebar from './Sidebar';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendarMinus,
  FaSearch,
} from 'react-icons/fa';
import { parseISO, format, addHours } from 'date-fns';

const ManageAttendance = () => {
  // ------------------ SIDEBAR LOGIC ------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // ------------------ ATTENDANCE STATES ------------------
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filter, setFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('https://13.53.130.198/attendance')
      .then((response) => response.json())
      .then((data) => {
        setAttendanceRecords(data);
        filterRecords('today', data);
      })
      .catch((error) =>
        console.error('Error fetching attendance records:', error)
      );
  }, []);

  const formatTime = (time) => {
    if (!time || time === 'No exit recorded') {
      return 'No exit recorded';
    }
    try {
      const date = parseISO(time);
      const datePlus = addHours(date, 5);
      return format(datePlus, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error parsing time:', error);
      return 'Invalid time';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Complete' ? (
      <FaCheckCircle className="text-green-500 inline-block ml-2" />
    ) : (
      <FaTimesCircle className="text-red-500 inline-block ml-2" />
    );
  };

  const filterRecords = (newFilter, records) => {
    const now = new Date();
    let startDate;

    switch (newFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'lastWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'lastMonth':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'lastYear':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
        break;
    }

    const filtered = records.filter((record) => {
      const detectionDate = new Date(record.detection_date);
      return detectionDate >= startDate;
    });

    const searched = filtered.filter((record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredRecords(searched);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    filterRecords(newFilter, attendanceRecords);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterRecords(filter, attendanceRecords);
  };

  return (
    <ProtectedRoute>
      <div className="flex overflow-x-hidden overflow-y-hidden flex-col min-h-screen bg-gray-800 text-white">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex flex-1">
          <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
          <main className="flex-1 p-4 md:p-8">
            <div className="px-2 sm:px-0">
              <div className="bg-gray-800 w-full sm:max-w-5xl sm:w-full p-4 sm:p-10 rounded-lg shadow-lg">
                <h2 className="text-xl sm:text-3xl font-extrabold text-center mb-6 flex items-center justify-center">
                  <FaCalendarDay className="mr-2 sm:mr-3 text-blue-500" />
                  Faculty Attendance Management
                </h2>

                <p className="text-sm sm:text-base text-center text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                  Faculty attendance is calculated daily. Faculty must be present for at least 8 hours.
                </p>

                {/* Search Bar */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative w-full max-w-md">
                    <FaSearch className="absolute top-3 left-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by Faculty Name..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                  {[
                    { filter: 'today', icon: FaCalendarDay, label: 'Today' },
                    { filter: 'lastWeek', icon: FaCalendarWeek, label: 'Last Week' },
                    { filter: 'lastMonth', icon: FaCalendarAlt, label: 'Last Month' },
                    { filter: 'lastYear', icon: FaCalendarMinus, label: 'Last Year' },
                  ].map(({ filter: btnFilter, icon: Icon, label }) => (
                    <button
                      key={btnFilter}
                      className={`flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-lg ${
                        filter === btnFilter
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-blue-500'
                      } transition-colors duration-200`}
                      onClick={() => handleFilterChange(btnFilter)}
                    >
                      <Icon className="mr-1 sm:mr-2" /> {label}
                    </button>
                  ))}
                </div>

                {/* Responsive Records Container */}
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="min-w-full bg-gray-700 border border-gray-600 text-sm sm:text-base">
                      <thead>
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300 border-b">Faculty Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300 border-b">Entry Time</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300 border-b">Exit Time</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300 border-b">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300 border-b">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-600 transition-colors">
                            <td className="py-3 px-4 border-b text-gray-200">{record.name}</td>
                            <td className="py-3 px-4 border-b text-gray-200">{formatTime(record.entry_time)}</td>
                            <td className="py-3 px-4 border-b text-gray-200">{formatTime(record.exit_time)}</td>
                            <td className="py-3 px-4 border-b text-gray-200 flex items-center">
                              {record.attendance_status}
                              {getStatusIcon(record.attendance_status)}
                            </td>
                            <td className="py-3 px-4 border-b text-gray-200">
                              {record.detection_date ? format(new Date(record.detection_date), 'yyyy-MM-dd') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <div key={record.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-300">Name:</span>
                              <span className="text-gray-200">{record.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-300">Entry:</span>
                              <span className="text-gray-200">{formatTime(record.entry_time)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-300">Exit:</span>
                              <span className="text-gray-200">{formatTime(record.exit_time)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-300">Status:</span>
                              <div className="flex items-center">
                                <span className="text-gray-200 mr-2">{record.attendance_status}</span>
                                {getStatusIcon(record.attendance_status)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-300">Date:</span>
                              <span className="text-gray-200">
                                {record.detection_date ? format(new Date(record.detection_date), 'yyyy-MM-dd') : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-4">No records found.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ManageAttendance;