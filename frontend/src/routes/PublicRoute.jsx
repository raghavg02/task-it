import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // If user is already logged in, redirect them to the dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
