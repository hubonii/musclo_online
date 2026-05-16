import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import LandingPage from '../../pages/landing/LandingPage';

/**
 * RootRedirect
 * Handles the logic for the base path (/).
 * If authenticated: Redirects to /dashboard.
 * If guest: Shows the LandingPage.
 */
const RootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  // While checking auth status, we can show the landing page or a minimal loader.
  // Showing the landing page as a fallback ensures no "blank" flashes for guest users.
  if (loading) return null; 

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

export default RootRedirect;
