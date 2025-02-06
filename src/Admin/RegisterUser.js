import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import Spinner from '../utilities/Spinner'; // Ensure the path is correct

// Import your new Header and Sidebar components
import Header from './Header';
import Sidebar from './Sidebar';

const RegisterUser = () => {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Togglers for sidebar
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Main form state
  const [entityType, setEntityType] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    regNumber: '',
    department: '',
    photo: null,
    facultyName: '',
    facultyId: '',
    workerName: '',
    workerId: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEntityChange = (e) => {
    setEntityType(e.target.value);
    setFormData({
      studentName: '',
      regNumber: '',
      department: '',
      photo: null,
      facultyName: '',
      facultyId: '',
      workerName: '',
      workerId: '',
    });
    setMessage('');
    setIsError(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      photo: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append('entityType', entityType);

    if (entityType === 'student') {
      formDataObj.append('studentName', formData.studentName);
      formDataObj.append('regNumber', formData.regNumber);
      formDataObj.append('department', formData.department);
      formDataObj.append('photo', formData.photo);
    } else if (entityType === 'faculty') {
      formDataObj.append('facultyName', formData.facultyName);
      formDataObj.append('facultyId', formData.facultyId);
      formDataObj.append('department', formData.department);
      formDataObj.append('photo', formData.photo);
    } else if (entityType === 'worker') {
      formDataObj.append('workerName', formData.workerName);
      formDataObj.append('workerId', formData.workerId);
      formDataObj.append('photo', formData.photo);
    }

    try {
      const response = await fetch('http://13.53.130.198:5000/register', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data = await response.json();
      setMessage(data.message);
      setIsError(false);

      if (response.status === 200) {
        // Clear the form
        setFormData({
          studentName: '',
          regNumber: '',
          department: '',
          photo: null,
          facultyName: '',
          facultyId: '',
          workerName: '',
          workerId: '',
        });
        setEntityType(''); // Reset entity type
      }
    } catch (error) {
      console.error('There was an error registering the user:', error);
      setMessage(error.message || 'Failed to register user.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      {/* Outer container similar to AdminDashboard */}
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
        
        {/* Reusable Header */}
        <Header 
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        
        <div className="flex flex-1">
          
          {/* Reusable Sidebar */}
          <Sidebar 
            isSidebarOpen={isSidebarOpen}
            closeSidebar={closeSidebar}
          />

          {/* Main content area */}
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="flex items-center justify-center py-3 px-4 sm:px-6 lg:px-8">
              {/* Inner Container */}
              <div className="max-w-3xl w-full bg-gray-800 p-10 rounded-lg shadow-lg">
                <h2 className="text-3xl font-extrabold text-center mb-6">
                  Register Person
                </h2>
                {/* Description */}
                <p className="text-center text-gray-300 mb-8">
                  Register students, faculty, and workers for face identification
                  and store their information in our databases to monitor security
                  on campus and allow only permitted individuals.
                </p>

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

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      onChange={handleEntityChange}
                      required
                      className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Entity Type</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="worker">Worker</option>
                    </select>
                  </div>

                  {/* Conditionally Render Entity-Specific Fields */}
                  {entityType === 'student' && (
                    <>
                      <div>
                        <label
                          htmlFor="studentName"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Student Name:
                        </label>
                        <input
                          type="text"
                          id="studentName"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter student name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="regNumber"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Registration Number:
                        </label>
                        <input
                          type="text"
                          id="regNumber"
                          name="regNumber"
                          value={formData.regNumber}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter registration number"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Department:
                        </label>
                        <input
                          type="text"
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter department"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="photo"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Complete Face Photo:
                        </label>
                        <input
                          type="file"
                          id="photo"
                          name="photo"
                          onChange={handleFileChange}
                          required
                          accept="image/*"
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {entityType === 'faculty' && (
                    <>
                      <div>
                        <label
                          htmlFor="facultyName"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Faculty Name:
                        </label>
                        <input
                          type="text"
                          id="facultyName"
                          name="facultyName"
                          value={formData.facultyName}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter faculty name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="facultyId"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Faculty ID:
                        </label>
                        <input
                          type="text"
                          id="facultyId"
                          name="facultyId"
                          value={formData.facultyId}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter faculty ID"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Department:
                        </label>
                        <input
                          type="text"
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter department"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="photo"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Complete Face Photo:
                        </label>
                        <input
                          type="file"
                          id="photo"
                          name="photo"
                          onChange={handleFileChange}
                          required
                          accept="image/*"
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {entityType === 'worker' && (
                    <>
                      <div>
                        <label
                          htmlFor="workerName"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Worker Name:
                        </label>
                        <input
                          type="text"
                          id="workerName"
                          name="workerName"
                          value={formData.workerName}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter worker name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="workerId"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Worker ID:
                        </label>
                        <input
                          type="text"
                          id="workerId"
                          name="workerId"
                          value={formData.workerId}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter worker ID"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="photo"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Complete Face Photo:
                        </label>
                        <input
                          type="file"
                          id="photo"
                          name="photo"
                          onChange={handleFileChange}
                          required
                          accept="image/*"
                          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center justify-center ${
                      loading ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        <span className="ml-2">Registering...</span>
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default RegisterUser;
