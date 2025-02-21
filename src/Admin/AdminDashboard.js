// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import Header from './Header';
import Sidebar from './Sidebar';

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  // Controls for sidebar open/close
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // States for charts
  const [userRegistrations, setUserRegistrations] = useState(null);
  const [alertsData, setAlertsData] = useState(null);

  // Example: Fetch chart data from backend (adjust to your own endpoints)
  useEffect(() => {
    // 1) Fetch User Registrations
    fetch('https://13.53.130.198/api/stats/user-registrations')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching user registrations`);
        }
        return response.json();
      })
      .then((data) => {
        const labels = data.map((item) => item.month);
        const counts = data.map((item) => item.count);
        setUserRegistrations({
          labels,
          datasets: [
            {
              label: 'User Registrations',
              data: counts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => console.error(error));

    // 2) Fetch Alerts Data
    fetch('https://13.53.130.198/api/stats/alerts-over-time')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching alerts-over-time`);
        }
        return response.json();
      })
      .then((data) => {
        const labels = data.map((item) =>
          new Date(item.date).toLocaleDateString()
        );
        const alerts = data.map((item) => item.count);
        setAlertsData({
          labels,
          datasets: [
            {
              label: 'Alerts Generated',
              data: alerts,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.4)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      })
      .catch((error) => console.error(error));

    // 3) (Optional) Fetch Attendance Data ...
  }, []);

  return (
    <ProtectedRoute>
      <div className=" flex max-w-full overflow-x-hidden flex-col justify-center text-white bg-gray-800 min-h-screen">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 bg-gray-800 overflow-auto">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Person Registration',
                  desc: 'Register and manage individuals',
                  link: '/admin-dashboard/register-user',
                  color: 'from-blue-600/30 to-blue-800/30'
                },
                { 
                  title: 'Alerts',
                  desc: 'Review unknown person alerts',
                  link: '/admin-dashboard/manage-alerts',
                  color: 'from-red-600/30 to-red-800/30'
                },
                { 
                  title: 'Faculty Attendance',
                  desc: 'Track attendance records',
                  link: '/admin-dashboard/manage-attendance',
                  color: 'from-green-600/30 to-green-800/30'
                }
              ].map((card, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${card.color} p-6 rounded-2xl shadow-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:-translate-y-1`}>
                  <h2 className="text-xl font-bold mb-3 text-gray-100">{card.title}</h2>
                  <p className="text-gray-400 mb-5 text-sm leading-relaxed">{card.desc}</p>
                  <a
                    href={card.link}
                    className="inline-flex items-center px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                  >
                    Go to {card.title.split(' ')[0]}
                    <span className="ml-2 text-blue-400">→</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Registrations Chart */}
              <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  User Registrations Over Time
                </h2>
                {userRegistrations ? (
                  <Bar
                    data={userRegistrations}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: { color: '#fff' },
                        },
                        title: {
                          display: true,
                          text: 'Monthly Registrations',
                          color: '#fff',
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: '#fff' },
                        },
                        y: {
                          ticks: { color: '#fff' },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400">Loading...</p>
                )}
              </div>

              {/* Alerts Data Chart */}
              <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Alerts Generated Over Time
                </h2>
                {alertsData ? (
                  <Line
                    data={alertsData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: { color: '#fff' },
                        },
                        title: {
                          display: true,
                          text: 'Alerts by Date',
                          color: '#fff',
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: '#fff' },
                        },
                        y: {
                          ticks: { color: '#fff' },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400">Loading...</p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
