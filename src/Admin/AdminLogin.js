// src/AdminLogin.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../utilities/Footer';
import { FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import the eye icons

const AdminLogin = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [loginSuccess, setLoginSuccess] = useState(false); // State for login success
  const navigate = useNavigate();

  // Function to handle logout
  const logout = () => {
    // Clear all session-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('destination');
    localStorage.removeItem('sessionExpiry');
    // Redirect to login page
    navigate('/login');
  };

  // Effect to check session validity on component mount
  useEffect(() => {
    const checkSession = () => {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        const currentTime = Date.now();
        if (currentTime >= expiryTime) {
          // Session has expired
          logout();
        } else {
          // Set timeout for the remaining time
          const remainingTime = expiryTime - currentTime;
          setTimeout(() => {
            logout();
          }, remainingTime);
        }
      }
    };

    checkSession();

    // Optionally, set an interval to regularly check the session
    const interval = setInterval(() => {
      checkSession();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [navigate]);

  // Effect to handle actions after successful login
  useEffect(() => {
    let redirectTimer;
    let logoutTimer;

    if (loginSuccess) {
      // Redirect after 2 seconds
      redirectTimer = setTimeout(() => {
        const destination = localStorage.getItem('destination');
        if (destination) {
          navigate(destination);
          localStorage.removeItem('destination');
        }
      }, 2000);

      // Set session expiration time (1 hour from now)
      const expiryTime = Date.now() + 3 * 60 * 60 * 1000; // 3 hour in milliseconds
      localStorage.setItem('sessionExpiry', expiryTime.toString());

      // Set a timeout to automatically logout after 3 hour
      logoutTimer = setTimeout(() => {
        logout();
      },3 * 60 * 60 * 1000); // 3 hour in milliseconds
    }

    // Cleanup the timers when the component unmounts or loginSuccess changes
    return () => {
      clearTimeout(redirectTimer);
      clearTimeout(logoutTimer);
    };
  }, [loginSuccess, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://13.53.130.198:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: userName, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the JWT token and role in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Determine destination based on role and whether security questions are set
        // Example snippet
let destination = '';

// First, check if security questions are set
if (!data.securityQuestionsSet) {
  // If not set, force the user to set them
  destination = '/login/set-security-questions';
} else {
  // Security questions are set, now direct user by role
  if (data.role === 'admin') {
    destination = '/admin-dashboard';
  } else if (data.role === 'security_incharge') {
    destination = '/incharge-dashboard';
  } else {
    // Optional: A catch-all for unexpected roles
    destination = '/unauthorized';
  }
}

localStorage.setItem('destination', destination);


        // Set login success to true to display the success message
        setLoginSuccess(true);
      } else {
        setError(data.message); // Show error if login fails
      }
    } catch (error) {
      setError('Server error, please try again');
    }
  };

  return (
    <>
      <div className="absolute inset-0 -z-10">
        <div
          className="min-h-screen flex justify-center items-center bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/path-to-background-image.jpg')" }}
        >
          <div className="absolute top-5 left-5">
            <Link to="/">
              <button className="flex m-6 items-center text-white hover:bg-gray-600 border border-gray-400 rounded-3xl px-4 py-3 transition duration-200">
                <FaArrowLeft className="mr-2" /> Back to Main
              </button>
            </Link>
          </div>


          {/* Login Container */}
          <div className="bg-gray-800 bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-md relative">
            {/* Success Message Overlay */}
            {loginSuccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90 rounded-lg animate-fadeIn pt-4 pb-10">
                <svg
                  className="w-24 h-20 text-green-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-white">Login Successful!</h2>
                <p className="text-gray-300">Redirecting to dashboard...</p>
              </div>
            )}

            {/* Form Content */}
            {!loginSuccess && (
              <>
                <div className="flex justify-center mb-6">
                  <img src="/face-trace-logo.png" alt="Logo" className="h-24" />
                </div>

                <h1 className="text-3xl font-bold text-center text-white mb-6">Login</h1>

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Username Input */}
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      placeholder="Username"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'} // Toggle between text and password types
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2 bg-transparent border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                    />
                    {/* Toggle password visibility */}
                    <div
                      className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-200 transition duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setShowPassword(!showPassword);
                        }
                      }}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && <p className="text-red-500 text-center">{error}</p>}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition duration-200"
                  >
                    Login
                  </button>
                </form>

                {/* Forgot Password */}
                <div className="text-center mt-4">
                  <Link to="/login/recover-password" className="text-blue-400 hover:text-blue-600 transition duration-200">
                    Forgot Password?
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
        <Footer/>
      </div>
      
    </>
  );
};

export default AdminLogin;
