import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import MemberDashboard from '../pages/MemberDashboard.jsx';
import Projects from '../pages/Projects.jsx';
import ProjectDetails from '../pages/ProjectDetails.jsx';
import Tasks from '../pages/Tasks.jsx';
import TeamManagement from '../pages/TeamManagement.jsx';
import Settings from '../pages/Settings.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={user?.role === 'admin' ? <Dashboard /> : <MemberDashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
