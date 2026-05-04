// Error boundary recovery screen for top-level runtime exceptions.
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Card from './Card';
import Button from './Button';
export default function GlobalErrorFallback({ error, resetErrorBoundary }) {
return (<div className="min-h-screen w-full bg-app flex flex-col items-center justify-center p-6 text-center">
            <Card className="max-w-md w-full p-8 md:p-12 shadow-neu flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center shadow-neu-inset">
                    <AlertTriangle size={40}/>
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Something went wrong</h1>
                    <p className="text-text-secondary text-sm px-4 leading-relaxed">
                        A critical error occurred while rendering the application. Your progress might not be lost, but a refresh is required to stabilize the UI.
                    </p>
                </div>

                <div className="w-full bg-app/50 p-4 rounded-xl border border-divider/5 text-left overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Technical Trace</p>
                    <p className="text-xs font-mono text-danger/80 truncate">
                        {error.message || 'Unknown runtime exception'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                    <Button variant="primary" className="flex-1 shadow-neu-sm py-4" onClick={() => {
            // Runs boundary reset handler, then reloads current page URL.
            resetErrorBoundary();
            window.location.reload();
        }} icon={<RefreshCw size={18}/>}>
                        Reload App
                    </Button>
                    {/* Navigates directly to dashboard route. */}
                    <Button variant="ghost" className="flex-1 py-4" onClick={() => window.location.href = '/dashboard'} icon={<Home size={18}/>}>
                        Go Home
                    </Button>
                </div>
                
                <p className="text-[10px] text-text-muted italic pt-2">
                    If this persists, please contact support or clear your browser cache.
                </p>
            </Card>
        </div>);
}


