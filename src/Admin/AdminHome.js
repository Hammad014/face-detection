// AdminHome.jsx
import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
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

const AdminHome = () => {
  const [userRegistrations, setUserRegistrations] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    // 1) Example: fetch user registrations
    fetch('http://localhost:5000/api/stats/user-registrations')
      .then((res) => res.json())
      .then((data) => {
        const labels = data.map((item) => item.month);
        const registrations = data.map((item) => item.count);
        setUserRegistrations({
          labels,
          datasets: [
            {
              label: 'User Registrations',
              data: registrations,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => console.error(error));

    // 2) Example: fetch alerts data
    fetch('http://localhost:5000/api/stats/alerts-over-time')
      .then((res) => res.json())
      .then((data) => {
        const labels = data.map((item) => new Date(item.date).toLocaleDateString());
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

    // 3) Example: fetch attendance data
    fetch('http://localhost:5000/api/stats/attendance-statistics')
      .then((res) => res.json())
      .then((data) => {
        const labels = ['Total Entries', 'Total Exits'];
        const counts = [data.totalEntries, data.totalExits];
        setAttendanceData({
          labels,
          datasets: [
            {
              label: 'Attendance',
              data: counts,
              backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
              borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="bg-gray-800 text-white">
      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
        {/* Card 1 */}
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
            Person Statistics
          </h2>
          <p className="text-gray-300 mb-2 md:mb-4">
            Monitor and analyze person registration data.
          </p>
          <a
            href="/admin-dashboard/register-user"
            className="text-blue-400 border rounded-3xl hover:bg-slate-800 p-2 text-sm md:text-base"
          >
            Go for Registration &rarr;
          </a>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
            Alerts Overview
          </h2>
          <p className="text-gray-300 mb-2 md:mb-4">
            Manage and review alerts generated on person detection.
          </p>
          <a
            href="/admin-dashboard/manage-alerts"
            className="text-blue-400 border rounded-3xl hover:bg-slate-800 p-2 text-sm md:text-base"
          >
            See Latest Alerts &rarr;
          </a>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
            Attendance Overview
          </h2>
          <p className="text-gray-300 mb-2 md:mb-4">
            Track faculty attendance and check status.
          </p>
          <a
            href="/admin-dashboard/manage-attendance"
            className="text-blue-400 border rounded-3xl hover:bg-slate-800 p-2 text-sm md:text-base"
          >
            Attendance Status &rarr;
          </a>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: User Registrations */}
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
                    position: 'top',
                    labels: { color: '#ffffff' },
                  },
                  title: {
                    display: true,
                    text: 'Monthly User Registrations',
                    color: '#ffffff',
                    font: { size: 16 },
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                  },
                },
                scales: {
                  x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.2)' },
                  },
                  y: {
                    ticks: { color: '#ffffff', stepSize: 5 },
                    grid: { color: 'rgba(255,255,255,0.2)' },
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </div>

        {/* Chart 2: Alerts Over Time */}
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
                    position: 'top',
                    labels: { color: '#ffffff' },
                  },
                  title: {
                    display: true,
                    text: 'Alerts Generated by Date',
                    color: '#ffffff',
                    font: { size: 16 },
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                  },
                },
                scales: {
                  x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.2)' },
                  },
                  y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.2)' },
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
