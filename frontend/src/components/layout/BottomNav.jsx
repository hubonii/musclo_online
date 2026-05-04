// Mobile bottom navigation shown on small screens.
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Calendar, History as HistoryIcon, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dash', path: '/dashboard' },
    { icon: Calendar, label: 'Programs', path: '/programs' },
    { icon: Dumbbell, label: 'Workout', path: '/workout', isPrimary: true },
    { icon: HistoryIcon, label: 'History', path: '/history' },
    { icon: TrendingUpIcon, label: 'Progress', path: '/progress' },
];
// Renders mobile-only bottom tab navigation from `NAV_ITEMS` config.
export default function BottomNav() {
return (<nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-neu pb-[env(safe-area-inset-bottom,0px)] h-[calc(3.75rem+env(safe-area-inset-bottom,0px))] ">
            <div className="flex items-center justify-around h-full px-4">
                {/* Renders one mobile tab button from each config row in `NAV_ITEMS`. */}
                {NAV_ITEMS.map((item) => (<NavLink key={item.path} to={item.path} className={({ isActive }) => cn('relative flex items-center justify-center w-full h-full transition-colors duration-100', isActive ? 'text-orange' : 'text-text-secondary')}>
                        {({ isActive }) => (<>
                                {/* Workout action is visually elevated to emphasize quick access. */}
                                {item.isPrimary ? (<div className={cn('absolute -top-5 flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200', isActive
                        ? 'bg-neu shadow-neu-inset text-orange scale-105'
                        : 'bg-neu text-text-primary hover:-translate-y-1')}>
                                        <item.icon size={26}/>
                                    </div>) : (<div className={cn("p-2 rounded-xl transition-all duration-200", isActive ? "shadow-neu-inset bg-neu-active" : "hover:bg-app/50")}>
                                        <item.icon size={20}/>
                                    </div>)}
                            </>)}
                    </NavLink>))}
            </div>
        </nav>);
}


