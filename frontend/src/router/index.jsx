// Browser router configuration with lazy-loaded page modules.
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Full-page Suspense loading component for lazy route chunks.
const PageLoader = () => (
    <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-[32px] bg-surface shadow-neu flex items-center justify-center animate-pulse border border-orange/10">
                <div className="w-10 h-10 rounded-full bg-orange shadow-[0_0_20px_rgba(234,88,12,0.4)]" />
            </div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] animate-pulse">
                Initializing Intelligence
            </p>
        </div>
    </div>
);

const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProgramsPage = lazy(() => import('../pages/ProgramsPage'));
const ProgramDetailsPage = lazy(() => import('../pages/ProgramDetailsPage'));
const RoutineBuilderPage = lazy(() => import('../pages/RoutineBuilderPage'));
const WorkoutPage = lazy(() => import('../pages/WorkoutPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const WorkoutDetailPage = lazy(() => import('../pages/WorkoutDetailPage'));
const ExercisesPage = lazy(() => import('../pages/ExercisesPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const ProgressPage = lazy(() => import('../pages/ProgressPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const EmailVerificationPage = lazy(() => import('../pages/EmailVerificationPage'));
const GoogleCallback = lazy(() => import('../pages/GoogleCallback'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const router = createBrowserRouter([
    // Public auth routes.
    { path: '/login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
    { path: '/register', element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
    { path: '/forgot-password', element: <Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense> },
    { path: '/reset-password', element: <Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense> },
    { path: '/verify-email', element: <Suspense fallback={<PageLoader />}><EmailVerificationPage /></Suspense> },
    { path: '/auth/callback', element: <Suspense fallback={<PageLoader />}><GoogleCallback /></Suspense> },
    {
        path: '/',
        element: (
            // Auth gate wrapper for all nested app routes.
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
            { path: 'programs', element: <Suspense fallback={<PageLoader />}><ProgramsPage /></Suspense> },
            { path: 'programs/:id', element: <Suspense fallback={<PageLoader />}><ProgramDetailsPage /></Suspense> },
            { path: 'programs/:programId/routines/:routineId', element: <Suspense fallback={<PageLoader />}><RoutineBuilderPage /></Suspense> },
            { path: 'workout', element: <Suspense fallback={<PageLoader />}><WorkoutPage /></Suspense> },
            { path: 'workout/:routineId', element: <Suspense fallback={<PageLoader />}><WorkoutPage /></Suspense> },
            { path: 'history', element: <Suspense fallback={<PageLoader />}><HistoryPage /></Suspense> },
            { path: 'history/:id', element: <Suspense fallback={<PageLoader />}><WorkoutDetailPage /></Suspense> },
            { path: 'exercises', element: <Suspense fallback={<PageLoader />}><ExercisesPage /></Suspense> },
            { path: 'progress', element: <Suspense fallback={<PageLoader />}><ProgressPage /></Suspense> },
            { path: 'profile', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
            { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> },
        ],
    },
    { path: '*', element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense> },
]);
