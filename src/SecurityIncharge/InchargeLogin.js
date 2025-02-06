import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLogin } from '../utilities/useLogin';  // Import the shared hook

const SecurityInChargeLogin = () => {
  const {
    userName,
    password,
    error,
    showPassword,
    loginSuccess,
    setUserName,
    setPassword,
    togglePasswordVisibility,
    handleLogin,
  } = useLogin();

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin('http://localhost:5000/login', '/security-dashboard');
  };

  return (
    <>
      <div className="particles absolute inset-0 -z-10">
        <div className="min-h-screen flex justify-center items-center bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/path-to-background-image.jpg')" }}>
          <div className="absolute top-5 left-5">
            <Link to="/">
              <button className="flex m-6 items-center text-white hover:bg-gray-600 border border-gray-400 rounded-3xl px-4 py-3">
                <FaArrowLeft className="mr-2" /> Back to Main
              </button>
            </Link>
          </div>

          <div className="bg-gray-800 bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-center mb-6">
              <img src="/face-trace-logo.png" alt="Logo" className="h-24" />
            </div>

            <h1 className="text-3xl font-bold text-center text-white mb-6">Security In-Charge Login</h1>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-600 text-white placeholder-gray-400 rounded-md"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2 bg-transparent border border-gray-600 text-white placeholder-gray-400 rounded-md"
                />
                <div
                  className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-200"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </div>
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Login
              </button>
            </form>

            <div className="text-center mt-4">
              <Link to="/recover-password" className="text-blue-400 hover:text-blue-600">Forgot Password?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityInChargeLogin;
