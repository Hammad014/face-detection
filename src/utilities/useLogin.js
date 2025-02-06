import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (url, redirectPath) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userName, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        const destination = data.securityQuestionsSet ? redirectPath : '/set-security-questions';
        localStorage.setItem('destination', destination);
        setLoginSuccess(true);
        setTimeout(() => navigate(destination), 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error, please try again.');
    }
  };

  return {
    userName,
    password,
    error,
    showPassword,
    loginSuccess,
    setUserName,
    setPassword,
    togglePasswordVisibility,
    handleLogin,
  };
};
