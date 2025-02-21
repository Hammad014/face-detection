import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';

// Remove old Topbar import
// import Topbar from '../utilities/Topbar';

// Import your Header and Sidebar
import Header from './Header';
import Sidebar from './Sidebar';

import {
  FaTrashAlt,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
} from 'react-icons/fa';

const DeletePerson = () => {
  // ------------------ SIDEBAR LOGIC ------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // ------------------ FORM / DELETE LOGIC ------------------
  const [entityType, setEntityType] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleDeleteClick = async () => {
    // Reset messages
    setMessage('');
    setIsError(false);

    // Basic validation
    if (!entityType || !uniqueValue) {
      setMessage('Please select an entity type and enter a unique identifier.');
      setIsError(true);
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(`https://13.53.130.198/check-person`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityType, uniqueValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Person exists, show confirmation popup
        setShowConfirmation(true);
        setIsError(false);
      } else if (response.status === 404) {
        // Person not found
        setMessage('Person not found in the database.');
        setIsError(true);
      } else {
        setMessage(data.message || 'Failed to verify person.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Server error. Please try again later.');
      setIsError(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`https://13.53.130.198/delete-person`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityType, uniqueValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Person deleted successfully.');
        setIsError(false);
        setShowConfirmation(false);
        // Optionally, clear the form
        setEntityType('');
        setUniqueValue('');
      } else {
        setMessage(data.message || 'Failed to delete person.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Server error. Please try again later.');
      setIsError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setMessage('');
    setIsError(false);
  };

  return (
    <ProtectedRoute>
      {/* Outer layout container */}
      <div className="flex overflow-x-hidden overflow-y-hidden  flex-col min-h-screen bg-gray-800 text-white">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              {/* Inner Container */}
              <div className="max-w-3xl w-full bg-gray-800 p-10 rounded-lg shadow-lg">
                <h2 className="text-3xl font-extrabold text-white text-center mb-6 flex items-center justify-center">
                  <FaTrashAlt className="mr-3 text-red-500" /> Delete Person
                </h2>

                {/* Success/Error Message */}
                {message && (
                  <div
                    className={`mb-4 text-center text-lg font-semibold ${
                      isError ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Delete Form */}
                <form className="space-y-6">
                  {/* Entity Type Selection */}
                  <div>
                    <label
                      htmlFor="entityType"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Entity Type:
                    </label>
                    <select
                      id="entityType"
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value)}
                      required
                      className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Entity Type</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="worker">Worker</option>
                    </select>
                  </div>

                  {/* Unique Identifier Input */}
                  <div>
                    <label
                      htmlFor="uniqueValue"
                      className="block text-sm font-medium text-gray-300"
                    >
                      {entityType === 'student'
                        ? 'Registration Number'
                        : entityType === 'faculty'
                        ? 'Faculty ID'
                        : entityType === 'worker'
                        ? 'Worker ID'
                        : 'Unique Identifier'}
                      :
                    </label>
                    <input
                      type="text"
                      id="uniqueValue"
                      value={uniqueValue}
                      onChange={(e) => setUniqueValue(e.target.value)}
                      required
                      className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={
                        entityType === 'student'
                          ? 'Enter Registration Number'
                          : entityType === 'faculty'
                          ? 'Enter Faculty ID'
                          : entityType === 'worker'
                          ? 'Enter Worker ID'
                          : 'Enter Unique Identifier'
                      }
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className={`w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center ${
                      isChecking ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Checking...
                      </>
                    ) : (
                      <>
                        <FaTrashAlt className="mr-2" /> Delete Person
                      </>
                    )}
                  </button>
                </form>

                {/* Confirmation Modal */}
                {showConfirmation && (
                  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-gray-700 p-8 rounded-lg shadow-lg max-w-md w-full">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <FaExclamationTriangle className="mr-2 text-yellow-400" /> Confirm
                        Deletion
                      </h3>
                      <p className="text-gray-300 mb-6">
                        Are you sure you want to delete this person? This action is{' '}
                        <span className="font-bold">irreversible</span>.
                      </p>
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={handleCancel}
                          className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 flex items-center"
                        >
                          <FaTimes className="mr-2" /> Cancel
                        </button>
                        <button
                          onClick={handleConfirmDelete}
                          className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 flex items-center"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" /> Deleting...
                            </>
                          ) : (
                            <>
                              <FaCheck className="mr-2" /> Confirm Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DeletePerson;
