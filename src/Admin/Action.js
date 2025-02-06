// Action.js
import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GrAction } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Action = () => {
  const [unknownAlerts, setUnknownAlerts] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    fetch("http://13.53.130.198:5000/alerts")
      .then((res) => res.json())
      .then((data) => {
        const unknownOnly = data.filter((alert) => alert.name === "Unknown");
        setUnknownAlerts(unknownOnly);
      })
      .catch((error) => {
        console.error("Error fetching alerts:", error);
        setError("Error fetching alerts.");
      });
  }, []);

  const totalPages = Math.ceil(unknownAlerts.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const generatePageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, "...");
      } else if (currentPage > totalPages - 3) {
        pageNumbers.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pageNumbers;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = unknownAlerts.slice(indexOfFirstItem, indexOfLastItem);

  const handleTakeAction = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  const handleSendOnWhatsApp = () => {
    const text = `Detection Alert:\n\nDetection Date: ${new Date(selectedAlert.timestamp).toLocaleDateString()}\nDetection Time: ${new Date(selectedAlert.timestamp).toLocaleTimeString()}`;
    const imageUrl = `http://13.53.130.198:5000${selectedAlert.additionalInfo.image_path}`;
    const message = `${text}\nImage URL: ${imageUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <h2 className="text-2xl font-bold text-gray-200 mb-8 text-center">
            Prohibited Person Alerts
          </h2>

          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50 shadow-xl">
            {currentItems.length === 0 ? (
              <p className="text-gray-400 text-center">No unknown persons detected</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((alert, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-red-700/30 to-red-800/30 p-6 rounded-2xl border border-red-800/50 hover:border-red-700/50 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <p className="text-gray-300 text-sm">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                        {alert.additionalInfo?.image_path && (
                          <img
                            src={`http://13.53.130.198:5000${alert.additionalInfo.image_path}`}
                            alt="Unknown Person"
                            className="rounded-xl shadow-md w-full"
                          />
                        )}
                        <button
                          onClick={() => handleTakeAction(alert)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                        >
                          Take Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center mt-8 space-x-4">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${
                      currentPage === 1 ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <FaChevronLeft size={18} />
                  </button>
                  
                  <div className="flex space-x-2">
                    {generatePageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span key={index} className="px-2 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg ${
                            page === currentPage
                              ? "bg-blue-600/50 text-blue-400 border border-blue-500/50"
                              : "text-gray-300 hover:bg-gray-700/50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${
                      currentPage === totalPages ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <FaChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>

          {isModalOpen && selectedAlert && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 shadow-2xl max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-6 text-gray-100">Take Action</h2>
                <div className="mb-6">
                  <img
                    src={`http://13.53.130.198:5000${selectedAlert.additionalInfo.image_path}`}
                    alt="Unknown Person"
                    className="rounded-xl shadow-md mb-4"
                  />
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="font-semibold">Detection Date:</span>{' '}
                      {new Date(selectedAlert.timestamp).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-semibold">Detection Time:</span>{' '}
                      {new Date(selectedAlert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between space-x-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-3 rounded-lg transition-all duration-300 border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendOnWhatsApp}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/20"
                  >
                    WhatsApp Alert
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Action;