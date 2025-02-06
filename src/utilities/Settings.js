// src/components/Settings.jsx

import React, { useState } from 'react';
import { FaUser, FaBell, FaLock } from 'react-icons/fa';
// import { updateProfilePicture, toggleNotifications, updatePassword } from '../api/adminSettings'; // Placeholder for API functions
// import AdminLogin from './AdminLogin'; // Assuming you might reuse some logic

const Settings = () => {
  // States for profile picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profilePictureMessage, setProfilePictureMessage] = useState('');

  // States for notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notificationsEnabled') === 'true'
  );
  const [notificationsMessage, setNotificationsMessage] = useState('');

  // States for password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleProfilePictureSubmit = async (e) => {
    e.preventDefault();
    if (!profilePicture) {
      setProfilePictureMessage('Please select a picture to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      const response = await fetch('http://localhost:5000/api/admin/update-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProfilePictureMessage('Profile picture updated successfully!');
        // Optionally, update the profile picture in the UI
      } else {
        setProfilePictureMessage(data.message || 'Failed to update profile picture.');
      }
    } catch (error) {
      console.error(error);
      setProfilePictureMessage('An error occurred while updating profile picture.');
    }
  };

  // Handle notifications toggle
  const handleNotificationsToggle = async () => {
    const newStatus = !notificationsEnabled;
    try {
      const response = await fetch('http://localhost:5000/api/admin/toggle-notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotificationsEnabled(newStatus);
        localStorage.setItem('notificationsEnabled', newStatus);
        setNotificationsMessage(`Notifications ${newStatus ? 'enabled' : 'disabled'} successfully!`);
      } else {
        setNotificationsMessage(data.message || 'Failed to update notifications settings.');
      }
    } catch (error) {
      console.error(error);
      setNotificationsMessage('An error occurred while updating notifications settings.');
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/update-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error(error);
      setPasswordMessage('An error occurred while updating password.');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>

      {/* Profile Picture Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FaUser className="mr-2" /> Profile Picture
        </h3>
        <form onSubmit={handleProfilePictureSubmit} className="flex flex-col md:flex-row items-center">
          <div className="mb-4 md:mb-0 md:mr-4">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center">
                <FaUser className="text-4xl" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="mb-2 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Upload
            </button>
          </div>
        </form>
        {profilePictureMessage && <p className="mt-2 text-sm">{profilePictureMessage}</p>}
      </div>

      {/* Notifications Toggle Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FaBell className="mr-2" /> Notifications
        </h3>
        <div className="flex items-center">
          <label htmlFor="notificationsToggle" className="mr-4">
            {notificationsEnabled ? 'Enable' : 'Disable'} Notifications
          </label>
          <button
            onClick={handleNotificationsToggle}
            className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${
              notificationsEnabled ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                notificationsEnabled ? 'translate-x-6' : ''
              }`}
            ></div>
          </button>
        </div>
        {notificationsMessage && <p className="mt-2 text-sm">{notificationsMessage}</p>}
      </div>

      {/* Update Password Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <FaLock className="mr-2" /> Update Password
        </h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Update Password
          </button>
          {passwordMessage && <p className="text-sm">{passwordMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Settings;
