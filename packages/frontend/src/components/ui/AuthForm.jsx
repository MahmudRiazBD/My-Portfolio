// src/components/ui/AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

const AuthForm = ({ isLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login, signup, getUserRole } = useAuth();

  const handleLoginSuccess = async (userId) => {
    const role = await getUserRole(userId);
    if (role === 'admin') {
      // Redirect to the admin panel. 
      // Assuming the admin panel is served at '/admin'.
      // This needs a full page reload to a different application.
      const adminUrl = window.location.origin.replace('//', '//admin.'); // Or your specific admin URL logic
      window.location.href = '/'; // Replace with your actual admin domain/path
    } else {
      navigate('/my-account');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      let response;
      if (isLogin) {
        response = await login(email, password);
        if (!response.error && response.data.user) {
          await handleLoginSuccess(response.data.user.id);
        }
      } else {
        response = await signup(email, password);
        if (!response.error && response.data.user) {
          setMessage('Signup successful! Please check your email to verify your account.');
        }
      }

      if (response.error) {
        setError(response.error.message);
      }

    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-500 text-sm">{message}</p>}

      <div>
        <Button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {isLogin ? 'Sign in' : 'Sign up'}
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
