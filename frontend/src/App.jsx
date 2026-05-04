// Root app shell: providers, error boundary, and router.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastProvider, useToast } from './components/ui/Toast';
import { TooltipProvider } from './components/ui/Tooltip';
import { useAuthStore } from './stores/useAuthStore';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { initOfflineSync, flushQueue, getPendingCount } from './lib/offlineQueue';
import { WifiOff } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Global offline status banner component.
function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(getPendingCount());
    const [syncing, setSyncing] = useState(false);
    const { toast } = useToast();

    const handleOnline = async () => {
        setIsOnline(true);
        const count = getPendingCount();
        if (count > 0 && !syncing) {
            setSyncing(true);
            try {
                const { synced, error } = await flushQueue();
                setPendingCount(getPendingCount());
                if (synced > 0) toast('success', `Synced ${synced} workout(s)`);
                if (error) toast('error', `Sync failed: ${error}`);
            } catch (err) {
                console.error('[OfflineSync] Flush failed:', err);
                toast('error', 'Sync process failed unexpectedly');
            } finally {
                setSyncing(false);
            }
        }
    };

    useEffect(() => {
        const handleOffline = () => {
            setIsOnline(false);
            setPendingCount(getPendingCount());
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Periodically check pending count.
    useEffect(() => {
        const interval = setInterval(() => setPendingCount(getPendingCount()), 5000);
        return () => clearInterval(interval);
    }, []);

    if (isOnline && pendingCount === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 px-4 py-2.5 text-center transition-all cursor-pointer hover:brightness-110 active:brightness-90"
            style={{ background: isOnline ? 'rgba(234, 88, 12, 0.95)' : 'rgba(245, 158, 11, 0.95)' }}
            onClick={() => isOnline && pendingCount > 0 && !syncing && handleOnline()}
        >
            {!isOnline && <WifiOff size={14} className="text-white flex-shrink-0" />}
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                {syncing
                    ? 'Syncing pending workouts...'
                    : !isOnline
                        ? `You're offline — data is cached${pendingCount > 0 ? ` • ${pendingCount} workout${pendingCount > 1 ? 's' : ''} pending` : ''}`
                        : `${pendingCount} workout${pendingCount > 1 ? 's' : ''} pending sync — click to retry`
                }
            </span>
        </div>
    );
}

function App() {
    const user = useAuthStore(s => s.user);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);

    // Total Memory Wipe on Logout: Ensures no data from User A stays in cache for User B.
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('[Auth] Clearing global query cache...');
            queryClient.clear();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Handle Google OAuth callback token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            // Store token and clean URL
            localStorage.setItem('musclo-token', token);
            // Clean up the URL to remove the sensitive token
            window.history.replaceState({}, document.title, window.location.pathname);
            // Fetch user data to populate the store
            useAuthStore.getState().fetchUser();
        }

        const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

        // Restore auth state for protected pages after reload.
        if (!publicPages.includes(window.location.pathname)) {
            useAuthStore.getState().fetchUser();
        }
    }, []);

    // Initialize offline workout sync listeners - specifically for the current user.
    useEffect(() => {
        if (user?.id) {
            const cleanup = initOfflineSync(user.id);
            return cleanup;
        }
    }, [user?.id]);

    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <ErrorBoundary>
            <OfflineBanner />
            <RouterProvider router={router}/>
            <Analytics />
          </ErrorBoundary>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>);
}

export default App;
