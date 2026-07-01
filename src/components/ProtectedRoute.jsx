import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function getUserRole() {
  return (localStorage.getItem('userRole') || '').toUpperCase();
}

// ===== PROTECTED ROUTES =====

export function RequireAdmin() {
  const role = getUserRole();
  const token = localStorage.getItem('accessToken');

  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/" replace />;

  return <Outlet />;
}

export function RequireStudent() {
  const role = getUserRole();
  const token = localStorage.getItem('accessToken');

  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'STUDENT') return <Navigate to="/" replace />;

  return <Outlet />;
}

export function RequireEnterprise() {
  const role = getUserRole();
  const token = localStorage.getItem('accessToken');

  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'ENTERPRISE') return <Navigate to="/" replace />;

  return <Outlet />;
}

export function RequireAuth() {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdminOrAuth() {
  const role = getUserRole();
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export { getUserRole };
