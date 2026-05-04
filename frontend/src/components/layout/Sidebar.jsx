// Desktop navigation sidebar for authenticated areas.
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Dumbbell, History as HistoryIcon, Search as SearchIcon, Moon, Sun, LogOut, User as UserIcon, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { useState } from 'react';
import { useToast } from '../ui/Toast';
import { getPendingCount, flushQueue } from '../../lib/offlineQueue';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Programs', path: '/programs' },
    { icon: Dumbbell, label: 'Workout', path: '/workout' },
    { icon: HistoryIcon, label: 'History', path: '/history' },
    { icon: SearchIcon, label: 'Exercises', path: '/exercises' },
    { icon: TrendingUpIcon, label: 'Progress', path: '/progress' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
];

// Static nav config drives icon/label/path rendering for primary desktop links.

// Renders desktop nav links plus account/theme/logout quick actions.
export default function Sidebar({ className }) {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { toast } = useToast();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (!navigator.onLine) {
            toast('error', 'You cannot log out while offline to prevent data loss.');
            return;
        }

        setIsLoggingOut(true);
        try {
            const pendingCount = getPendingCount(user?.id);
            if (pendingCount > 0) {
                toast('info', `Syncing ${pendingCount} item(s) before logout...`);
                await flushQueue(user?.id);
            }
            logout();
        } catch (error) {
            console.error('[Logout] Sync failed:', error);
            toast('error', 'Failed to sync data before logout. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <aside className={cn("hidden md:flex flex-col w-64 h-screen bg-surface sticky top-0", className)}>
            {/* Brand area */}
            <div className="flex flex-col items-center justify-center px-6 pt-10 pb-4 shrink-0">
                <NavLink to="/dashboard" className="transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                    <img src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"} alt="MUSCLO" className="h-9 w-auto object-contain" />
                </NavLink>
            </div>

            {/* Primary app navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {/* Maps config array to one NavLink item per app section. */}
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-100',
                            isActive
                                ? 'bg-app shadow-neu-inset text-orange'
                                : 'text-text-secondary hover:text-text-primary hover:bg-app/50 hover:shadow-neu-sm hover:-translate-y-0.5'
                        )}
                    >
                        <item.icon size={20} className="shrink-0" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Profile quick link + theme/logout actions */}
            <div className="p-4 shrink-0">
                {/* Bottom section groups account shortcut with session/theme controls. */}
                <NavLink
                    to="/profile"
                    className={({ isActive }) => cn(
                        'flex items-center gap-3 mb-4 px-2 py-2 rounded-lg transition-colors cursor-pointer',
                        isActive ? 'bg-orange/10 text-orange' : 'hover:bg-app'
                    )}
                >
                    {/* Avatar block reflects current auth user data from store state. */}
                    <Avatar name={user?.name || 'User'} src={user?.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>
                </NavLink>

                <div className="flex gap-2">
                    {/* Theme toggle and logout buttons share equal width for balanced footer layout. */}
                    <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        <button
                            onClick={toggleTheme}
                            className="flex-1 flex justify-center items-center py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-app transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </Tooltip>
                    <Tooltip content="Logout">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={cn(
                                "flex-1 flex justify-center items-center py-2 rounded-lg text-danger hover:bg-danger/10 transition-colors",
                                isLoggingOut && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <LogOut size={18} className={isLoggingOut ? "animate-spin" : ""} />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </aside>
    );
}


