import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../ProtectedRoute';

// Import your Header and Sidebar
import Header from './Header';
import Sidebar from './Sidebar';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Spinner from '../utilities/Spinner'; // Adjust path if needed

const predefinedDisciplineCases = [
  'Disruptive behavior during lectures.',
  'Unprofessional conduct with peers.',
  'Smoking on campus.',
  'Violation of dress code.',
];

const UpdatePerson = () => {
  // Sidebar open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Existing state for form logic
  const [entityType, setEntityType] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [personData, setPersonData] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    regNumber: '',
    department: '',
    facultyName: '',
    facultyId: '',
    workerName: '',
    workerId: '',
    photo: null,
    disciplineCase: '',
    banStartDate: null,
    banEndDate: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [selectedDisciplineCase, setSelectedDisciplineCase] = useState('');
  const [customDisciplineCase, setCustomDisciplineCase] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset form when entityType is changed
  const handleEntityChange = (e) => {
    setEntityType(e.target.value);
    setUniqueValue('');
    setPersonData(null);
    setFormData({
      studentName: '',
      regNumber: '',
      department: '',
      facultyName: '',
      facultyId: '',
      workerName: '',
      workerId: '',
      photo: null,
      disciplineCase: '',
      banStartDate: null,
      banEndDate: null,
    });
    setEditMode(false);
    setFetchSuccess(false);
    setMessage('');
    setSelectedDisciplineCase('');
    setCustomDisciplineCase('');
  };

  // Fetch person data
  const handleFetchPerson = async () => {
    try {
      const response = await fetch('https://13.53.130.198/fetch-person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityType, uniqueValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setPersonData(data);

        // Destructure to exclude facePhoto
        const { facePhoto, ...restData } = data;

        // Check if disciplineCase from DB matches a predefined case
        const isPredefinedCase = predefinedDisciplineCases.includes(
          data.disciplineCase
        );

        setSelectedDisciplineCase(
          data.disciplineCase ? (isPredefinedCase ? data.disciplineCase : 'Other') : ''
        );

        setCustomDisciplineCase(
          !isPredefinedCase && data.disciplineCase ? data.disciplineCase : ''
        );

        setFormData({
          ...restData,
          disciplineCase: data.disciplineCase || '',
          banStartDate: data.banStartDate ? new Date(data.banStartDate) : null,
          banEndDate: data.banEndDate ? new Date(data.banEndDate) : null,
          photo: null, // Ensure photo is null initially
        });

        setMessage('Person data fetched successfully.');
        setFetchSuccess(true);
        setIsError(false);
      } else {
        setMessage(data.message);
        setIsError(true);
      }
    } catch (error) {
      setMessage('Failed to fetch person data.');
      setIsError(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'disciplineCase') {
      setSelectedDisciplineCase(value);
      if (value === 'Other') {
        setFormData((prevData) => ({
          ...prevData,
          disciplineCase: customDisciplineCase,
        }));
      } else {
        setCustomDisciplineCase('');
        setFormData((prevData) => ({
          ...prevData,
          disciplineCase: value,
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCustomDisciplineCaseChange = (e) => {
    const { value } = e.target;
    setCustomDisciplineCase(value);
    setFormData((prevData) => ({
      ...prevData,
      disciplineCase: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      photo: e.target.files[0],
    }));
  };

  // Handle updating person data
  const handleUpdatePerson = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    // Validation checks
    if (formData.disciplineCase && (!formData.banStartDate || !formData.banEndDate)) {
      setMessage('Please select both ban start date and ban end date.');
      setIsError(true);
      setIsUpdating(false);
      return;
    }

    if (
      formData.banStartDate &&
      formData.banEndDate &&
      formData.banStartDate > formData.banEndDate
    ) {
      setMessage('Ban start date cannot be after ban end date.');
      setIsError(true);
      setIsUpdating(false);
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('entityType', entityType);

    // Append common fields
    formDataObj.append('disciplineCase', formData.disciplineCase || '');
    formDataObj.append(
      'banStartDate',
      formData.banStartDate
        ? formData.banStartDate.toISOString().split('T')[0]
        : ''
    );
    formDataObj.append(
      'banEndDate',
      formData.banEndDate ? formData.banEndDate.toISOString().split('T')[0] : ''
    );

    // Append entity-specific fields
    if (entityType === 'student') {
      formDataObj.append('studentName', formData.studentName);
      formDataObj.append('regNumber', formData.regNumber);
      formDataObj.append('department', formData.department);
    } else if (entityType === 'faculty') {
      formDataObj.append('facultyName', formData.facultyName);
      formDataObj.append('facultyId', formData.facultyId);
      formDataObj.append('department', formData.department);
    } else if (entityType === 'worker') {
      formDataObj.append('workerName', formData.workerName);
      formDataObj.append('workerId', formData.workerId);
    }

    // Append photo if a new one is selected
    if (formData.photo) {
      formDataObj.append('photo', formData.photo);
    }

    try {
      const response = await fetch('https://13.53.130.198/update-person', {
        method: 'POST',
        body: formDataObj,
      });

      if (response.ok) {
        setMessage('Person updated successfully.');
        setIsError(false);
        setEditMode(false);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to update person.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Error updating person.');
      setIsError(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-remove discipline case if banEndDate is expired
  useEffect(() => {
    if (formData.banEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(formData.banEndDate);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        // Ban end date has expired, remove discipline case
        removeDisciplineCase();
      }
    }
  }, [formData.banEndDate]);

  // Remove discipline case from DB
  const removeDisciplineCase = async () => {
    try {
      const response = await fetch('https://13.53.130.198/remove-discipline-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityType, uniqueValue }),
      });

      if (response.ok) {
        setFormData((prevData) => ({
          ...prevData,
          disciplineCase: '',
          banStartDate: null,
          banEndDate: null,
        }));
        setSelectedDisciplineCase('');
        setCustomDisciplineCase('');
        setMessage('Discipline case has been removed as the ban end date expired.');
        setIsError(false);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to remove discipline case.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Error removing discipline case.');
      setIsError(true);
    }
  };

  return (
    <ProtectedRoute>
      {/* Outer layout container (similar to AdminDashboard) */}
      <div className="flex flex-col min-h-screen bg-gray-700 text-white">
        {/* Header */}
        <Header 
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar 
            isSidebarOpen={isSidebarOpen}
            closeSidebar={closeSidebar}
          />

          {/* Main content */}
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto p-10 rounded-lg shadow-lg mt-10">
              <h2 className="text-3xl font-bold text-center text-white mb-6">
                Update Person
              </h2>

              <form className="space-y-6">
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
                    className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                  >
                    <option value="">Select Entity Type</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="worker">Worker</option>
                  </select>
                </div>

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
                    className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                    disabled={fetchSuccess} // Disable after successful fetch
                  />
                </div>

                {!fetchSuccess && (
                  <button
                    type="button"
                    onClick={handleFetchPerson}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Fetch Person
                  </button>
                )}
              </form>

              {personData && (
                <>
                  <form onSubmit={handleUpdatePerson} className="space-y-6 mt-6">
                    {/* Entity-specific fields */}
                    {entityType === 'student' && (
                      <>
                        <div>
                          <label
                            htmlFor="studentName"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Name:
                          </label>
                          <input
                            type="text"
                            id="studentName"
                            name="studentName"
                            value={formData.studentName || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
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
                            value={formData.regNumber || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
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
                            value={formData.department || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
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
                            value={formData.facultyName || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
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
                            value={formData.facultyId || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
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
                            value={formData.department || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
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
                            value={formData.workerName || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
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
                            value={formData.workerId || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            disabled={!editMode}
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* Discipline Case Section */}
                    <div>
                      <label
                        htmlFor="disciplineCase"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Discipline Case:
                      </label>
                      <select
                        id="disciplineCase"
                        name="disciplineCase"
                        value={selectedDisciplineCase || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                        disabled={!editMode}
                      >
                        <option value="">Select Discipline Case (Optional)</option>
                        {predefinedDisciplineCases.map((caseItem, index) => (
                          <option key={index} value={caseItem}>
                            {caseItem}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Custom Discipline Case Input */}
                    {((selectedDisciplineCase === 'Other' && editMode) ||
                      (!predefinedDisciplineCases.includes(formData.disciplineCase) &&
                        !editMode)) && (
                      <div>
                        <label
                          htmlFor="customDisciplineCase"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Custom Discipline Case:
                        </label>
                        <input
                          type="text"
                          id="customDisciplineCase"
                          name="customDisciplineCase"
                          value={customDisciplineCase}
                          onChange={handleCustomDisciplineCaseChange}
                          className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                          placeholder="Enter custom discipline case"
                          disabled={!editMode}
                        />
                      </div>
                    )}

                    {/* Ban Period Date Pickers */}
                    {formData.disciplineCase && (
                      <>
                        <div>
                          <label
                            htmlFor="banStartDate"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Ban Start Date:
                          </label>
                          {editMode ? (
                            <DatePicker
                              selected={formData.banStartDate}
                              onChange={(date) =>
                                setFormData((prevData) => ({
                                  ...prevData,
                                  banStartDate: date,
                                }))
                              }
                              dateFormat="yyyy-MM-dd"
                              className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            />
                          ) : (
                            <input
                              type="text"
                              value={
                                formData.banStartDate
                                  ? formData.banStartDate.toISOString().split('T')[0]
                                  : ''
                              }
                              disabled
                              className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            />
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="banEndDate"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Ban End Date:
                          </label>
                          {editMode ? (
                            <DatePicker
                              selected={formData.banEndDate}
                              onChange={(date) =>
                                setFormData((prevData) => ({
                                  ...prevData,
                                  banEndDate: date,
                                }))
                              }
                              dateFormat="yyyy-MM-dd"
                              className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                              minDate={formData.banStartDate}
                            />
                          ) : (
                            <input
                              type="text"
                              value={
                                formData.banEndDate
                                  ? formData.banEndDate.toISOString().split('T')[0]
                                  : ''
                              }
                              disabled
                              className="mt-1 block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                            />
                          )}
                        </div>
                      </>
                    )}

                    {/* Button to remove discipline case if in edit mode */}
                    {formData.disciplineCase && editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prevData) => ({
                            ...prevData,
                            disciplineCase: '',
                            banStartDate: null,
                            banEndDate: null,
                          }));
                          setSelectedDisciplineCase('');
                          setCustomDisciplineCase('');
                        }}
                        className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
                      >
                        Remove Discipline Case
                      </button>
                    )}

                    {/* Face Photo Section */}
                    <div>
                      <label
                        htmlFor="photo"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Face Photo:
                      </label>
                      {/* 
                        Optionally show existing facePhoto if you'd like:
                        {personData.facePhoto && (
                          <img
                            src={`http://localhost:5000/${personData.facePhoto}`}
                            alt="Person's Face"
                            className="mt-2 mb-4 w-40 h-40 object-cover rounded-lg"
                          />
                        )}
                      */}
                      {editMode && (
                        <>
                          <input
                            type="file"
                            id="photo"
                            name="photo"
                            onChange={handleFileChange}
                            className="block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-white"
                          />
                          <p className="text-sm text-gray-400">
                            Change Image (Optional)
                          </p>
                        </>
                      )}
                    </div>

                    {/* Edit and Update Buttons */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(!editMode);
                        setMessage('');
                      }}
                      className="w-full py-3 px-4 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200"
                    >
                      {editMode ? 'Cancel Edit' : 'Edit Record'}
                    </button>

                    {editMode && (
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className={`w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center ${
                          isUpdating ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        {isUpdating ? (
                          <>
                            <Spinner />
                            <span className="ml-2">Updating...</span>
                          </>
                        ) : (
                          'Update Person'
                        )}
                      </button>
                    )}
                  </form>

                  {/* Show success/error message */}
                  {message && (
                    <div
                      className={`mt-4 text-center text-lg font-semibold ${
                        isError ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UpdatePerson;
