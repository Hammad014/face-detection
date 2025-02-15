import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; // For navigation to main page or back button
import { FaArrowLeft } from 'react-icons/fa'; // For back icon

const SetSecurityQuestions = () => {
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage

      const response = await fetch('https://13.53.130.198/set-security-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        },
        body: JSON.stringify({
          question1: 'What is your favorite city?',
          answer1,
          question2: 'What is your favorite dish?',
          answer2,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message and redirect after a few seconds
        setSuccess('Security questions set successfully! Redirecting to dashboard...');
        setTimeout(() => {
          const role = localStorage.getItem('role');
          if (role === 'admin') {
            navigate('/admin-dashboard');
          } else if (role === 'security') {
            navigate('/incharge-dashboard');
          } else {
            navigate('/'); // Default route
          }
        }, 3000); // Redirect after 3 seconds
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Server error, please try again');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-5">
        <div className="h-28 w-28">
          <img src="/face-trace-logo.png" alt="Logo" className="w-full" />
        </div>
        <div className="flex justify-end">
          <Link to="/">
            <button className="flex items-center text-blue-400 hover:text-blue-800">
              <FaArrowLeft className="mr-2" /> Back to Main
            </button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Set Security Questions
          </h2>

          {success ? (
            <p className="text-green-600 text-center mb-4">{success}</p> // Success message
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label className="block mb-2 text-gray-600">Security Question 1:</label>
                <input
                  type="text"
                  value="What is your favorite city?"
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                />
                <label className="block mt-3 mb-2 text-gray-600">Answer 1</label>
                <input
                  type="text"
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block mb-2 text-gray-600">Security Question 2:</label>
                <input
                  type="text"
                  value="What is your favorite dish?"
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                />
                <label className="block mt-3 mb-2 text-gray-600">Answer 2</label>
                <input
                  type="text"
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition duration-200"
              >
                Set Security Questions
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default SetSecurityQuestions;
