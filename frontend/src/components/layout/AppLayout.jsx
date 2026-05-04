// Main authenticated shell: sidebar/topbar/bottom-nav around routed page content.
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import PageTransition from './PageTransition';
import AIChatComponent from '../ui/AIChatComponent';
import { cn } from '../../lib/utils';

// Wraps authenticated pages with shared navigation chrome and chat entry.
export default function AppLayout() {
    const location = useLocation();
    // Builder/workout pages hide some chrome to maximize usable screen space.
    const isFullscreenPage = location.pathname.includes('/builder/');
    const isWorkoutPage = location.pathname.startsWith('/workout');
return (<div className="flex h-[100dvh] w-full bg-app overflow-hidden">
            {!isFullscreenPage && <Sidebar />}
            <div className="flex flex-col flex-1 h-full min-w-0 relative">
                {(!isFullscreenPage && !isWorkoutPage) && <TopBar />}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className={cn(
                        "w-full h-full",
                        (!isFullscreenPage && !isWorkoutPage) && "md:pr-16 lg:pr-24 xl:pr-32"
                    )}>
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>
                </main>
                {!isFullscreenPage && <BottomNav />}
            </div>
            <AIChatComponent />
        </div>);
}

