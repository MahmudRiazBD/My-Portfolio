import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You can show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    // If user is not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
