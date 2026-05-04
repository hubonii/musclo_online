// Mobile top bar with links for exercise search, dashboard, and profile.
import { NavLink } from 'react-router-dom';
import { Search, Sun, Moon, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';

export default function TopBar() {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

return (
        // Hidden on desktop because sidebar handles main navigation there.
        <header className="md:hidden sticky top-0 z-40 h-auto min-h-[4.5rem] w-full bg-surface shadow-neu-sm safe-area-top">
            <div className="relative flex items-center justify-center h-full min-h-[4.5rem] px-6">
                <NavLink to="/exercises" className="absolute left-4 p-2 text-text-secondary hover:text-text-primary transition-colors" aria-label="Search Exercises">
                    <Search size={22}/>
                </NavLink>
                {/* Center area keeps brand logo fixed between left/right action buttons. */}
                <NavLink to="/dashboard" className="flex items-center justify-center flex-1 h-12 transition-transform active:scale-95">
                    {/* Swap logo asset to preserve contrast across light/dark themes. */}
                    <img src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"} alt="MUSCLO" className="h-8 w-auto max-w-[150px] max-h-8 object-contain"/>
                </NavLink>
                <div className="absolute right-4 flex items-center">
                    <NavLink to="/profile" className="p-1">
                        <Avatar name={user?.name || 'User'} src={user?.avatar_url} size="sm"/>
                    </NavLink>
                </div>
            </div>
        </header>
    );
}


