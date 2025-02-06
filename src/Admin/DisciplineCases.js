import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../ProtectedRoute';

// Import your Header and Sidebar
import Header from './Header';
import Sidebar from './Sidebar';

const DisciplineCases = () => {
  // Sidebar open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Existing state
  const [disciplineCases, setDisciplineCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDisciplineCases = async () => {
      try {
        const response = await fetch('http://13.53.130.198:5000/discipline-cases');
        if (!response.ok) {
          throw new Error('Failed to fetch discipline cases.');
        }
        const data = await response.json();
        setDisciplineCases(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error fetching discipline cases.');
        setLoading(false);
      }
    };

    fetchDisciplineCases();
  }, []);

  return (
    <ProtectedRoute>
      {/* Outer layout container */}
      <div className="flex flex-col min-h-screen bg-gray-800 text-white">
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
            <div className="max-w-6xl mx-auto p-10 rounded-lg shadow-lg mt-10">
              <h2 className="text-3xl font-bold text-center text-white mb-6">
                Discipline Cases
              </h2>

              {loading ? (
                <p className="text-center text-gray-400">Loading...</p>
              ) : error ? (
                <p className="text-center text-red-600">{error}</p>
              ) : disciplineCases.length === 0 ? (
                <p className="text-center text-gray-400">
                  No discipline cases found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Entity Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Unique ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Discipline Case
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {disciplineCases.map((caseItem, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            {caseItem.entityType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            {caseItem.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            {caseItem.uniqueId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            {caseItem.disciplineCase}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DisciplineCases;
