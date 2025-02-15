import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './utilities/Footer';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaLock,
  FaQuestionCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

const RecoverPassword = () => {
  const navigate = useNavigate();

  // --------------------- States ---------------------
  const [recoveryMethod, setRecoveryMethod] = useState(null); 
  const [userName, setUserName] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const [email, setEmail] = useState('');

  // Email-based Recovery (OTP) states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [retrievedUsername, setRetrievedUsername] = useState(''); // from DB after OTP verification

  // New password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  // UI/feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Evaluate password strength
  const evaluatePasswordStrength = (password) => {
    let strength = 'Weak';
    const regexMedium = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    const regexStrong = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (regexStrong.test(password)) {
      strength = 'Strong';
    } else if (regexMedium.test(password)) {
      strength = 'Medium';
    }
    setPasswordStrength(strength);
  };

  // Reset the form
  const resetForm = () => {
    setUserName('');
    setSecurityAnswer1('');
    setSecurityAnswer2('');
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setQuestionsAnswered(false);
    setPasswordStrength('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setRecoveryMethod(null);

    // Reset OTP states
    setOtpSent(false);
    setOtp('');
    setOtpVerified(false);
    setRetrievedUsername('');
  };

  // Choose recovery method
  const handleRecoveryMethodSelection = (method) => {
    resetForm();
    setRecoveryMethod(method);
  };

  // --------------------- Security Questions Flow ---------------------
  const handleVerifySecurityAnswers = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://13.53.130.198/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userName,
          security_answer1: securityAnswer1,
          security_answer2: securityAnswer2,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setQuestionsAnswered(true);
        setSuccess('Security answers verified. You can now set a new password.');
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (error) {
      setError('Server error, please try again');
    } finally {
      setLoading(false);
    }
  };

  // --------------------- Email (OTP) Flow ---------------------
  // 1) Send OTP to Email
  const handleSendOtpEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://13.53.130.198/recover-password-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setSuccess('OTP has been sent to your email. Please check your inbox.');
      } else {
        setError(data.message || 'Email recovery failed.');
      }
    } catch (error) {
      setError('Server error, please try again');
    } finally {
      setLoading(false);
    }
  };

  // 2) Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://13.53.130.198/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }), 
      });

      const data = await response.json();

      if (response.ok) {
        // OTP verified
        setOtpVerified(true);
        setRetrievedUsername(data.username); 
        setSuccess('OTP verified! You can now set a new password.');
      } else {
        setError(data.message || 'OTP verification failed.');
      }
    } catch (error) {
      setError('Server error, please try again');
    } finally {
      setLoading(false);
    }
  };

  // --------------------- Reset Password (common for both flows) ---------------------
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength === 'Weak') {
      setError('Password strength is too weak. Please choose a stronger password.');
      setLoading(false);
      return;
    }

    // The username we use depends on the path:
    const finalUsername = questionsAnswered ? userName : retrievedUsername;

    try {
      const response = await fetch('https://13.53.130.198/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: finalUsername,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Password update failed.');
      }
    } catch (error) {
      setError('Server error, please try again');
    } finally {
      setLoading(false);
    }
  };

  const canResetPassword = questionsAnswered || otpVerified;

  return (
    <>
      {/* Header + Logo */}
      <div className="flex justify-between items-center">
        <div className="h-28 w-28 m-4">
          <img src="/face-trace-logo.png" alt="Logo" />
        </div>
        <div className="flex justify-end p-4 mr-5">
          <Link to="/login">
            <button className="flex m-6 items-center text-white hover:bg-gray-600 border border-gray-400 rounded-3xl px-4 py-3 transition duration-200">
              <FaArrowLeft className="mr-2" /> Back to Login
            </button>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex justify-center items-center mb-20">
        <div className="bg-gray-800 text-gray-400 bg-opacity-90 p-8 rounded-lg shadow-2xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-10 text-white">
            Password Recovery
          </h1>

          {/* Success / Error messages */}
          {success && <p className="text-green-600 text-center mb-4">{success}</p>}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {/* Choose Recovery Method */}
          {!recoveryMethod && (
            <div className="flex flex-col">
              <button
                onClick={() => handleRecoveryMethodSelection('email')}
                className="flex items-center bg-slate-800 py-5 px-4 border-t-2 text-white font-semibold shadow-md hover:bg-slate-700"
              >
                <FaEnvelope className="mr-2" /> Recover through Email
              </button>
              <button
                onClick={() => handleRecoveryMethodSelection('security')}
                className="flex items-center bg-slate-800 py-5 px-4 border-t-2 text-white font-semibold shadow-md hover:bg-slate-700"
              >
                <FaQuestionCircle className="mr-2" /> Recover through Security Questions
              </button>
            </div>
          )}

          {/* ------------------ EMAIL RECOVERY UI ------------------ */}
          {recoveryMethod === 'email' && !canResetPassword && (
            <div>
              {/* If OTP not sent yet, show email field */}
              {!otpSent && (
                <form onSubmit={handleSendOtpEmail} className="space-y-6 mt-6">
                  <div className="form-group mb-4 relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full ${
                      loading ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Send OTP to Email'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setRecoveryMethod(null)}
                      className="text-blue-400 hover:text-blue-600 transition duration-200"
                    >
                      &larr; Back to Recovery Options
                    </button>
                  </div>
                </form>
              )}

              {/* If OTP was sent, show OTP verification form */}
              {otpSent && !otpVerified && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 mt-6">
                  <div className="form-group mb-4 relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter the OTP you received"
                      className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full ${
                      loading ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ------------------ SECURITY Qs RECOVERY UI ------------------ */}
          {recoveryMethod === 'security' && !canResetPassword && (
            <form onSubmit={handleVerifySecurityAnswers} className="space-y-6 mt-6">
              <div className="form-group mb-4 relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-4 relative">
                <FaQuestionCircle className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="What is your favorite city?"
                  className="bg-transparent text-white border border-gray-600 pl-10 pr-4 py-2 w-full placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={securityAnswer1}
                  onChange={(e) => setSecurityAnswer1(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-4 relative">
                <FaQuestionCircle className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="What is your favorite dish?"
                  className="bg-transparent text-white pl-10 pr-4 py-2 w-full border border-gray-600 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={securityAnswer2}
                  onChange={(e) => setSecurityAnswer2(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Verify Security Answers'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setRecoveryMethod(null)}
                  className="text-blue-400 hover:text-blue-600 transition duration-200"
                >
                  &larr; Back to Recovery Options
                </button>
              </div>
            </form>
          )}

          {/* ------------------ NEW PASSWORD FIELDS (if canResetPassword) ------------------ */}
          {recoveryMethod && canResetPassword && (
            <form onSubmit={handlePasswordReset} className="space-y-6 mt-6">
              <div className="form-group mb-4 relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  className="bg-transparent text-white pl-10 pr-10 py-2 w-full border border-gray-600 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    evaluatePasswordStrength(e.target.value);
                  }}
                  required
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-400"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  role="button"
                  tabIndex={0}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>

              {newPassword && (
                <div className="mb-4">
                  <p
                    className={`text-sm ${
                      passwordStrength === 'Strong'
                        ? 'text-green-500'
                        : passwordStrength === 'Medium'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    Password Strength: {passwordStrength}
                  </p>
                </div>
              )}

              <div className="form-group mb-4 relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  className="bg-transparent text-white pl-10 pr-10 py-2 w-full border border-gray-600 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  role="button"
                  tabIndex={0}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>

              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
        
      </div>
      <Footer/>
    </>
  );
};

export default RecoverPassword;
