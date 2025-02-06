// src/components/UserManagement.jsx
import React, { useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer'); // Default role
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token'); // Ensure token is stored on login
      const response = await axios.post(
        'http://localhost:5000/register',
        { username, password, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(response.data.message);
      setUsername('');
      setPassword('');
      setRole('viewer');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Username</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-600 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-gray-600 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Role</label>
          <select
            className="w-full p-2 rounded bg-gray-600 text-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
            {/* Add more roles if needed */}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default UserManagement;
