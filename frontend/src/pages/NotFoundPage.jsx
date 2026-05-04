// Fallback page shown for unknown routes.
import { Link } from 'react-router-dom';
// Shows static 404 content and recovery link to dashboard route.
export default function NotFoundPage() {
return (<div className="min-h-screen flex items-center justify-center bg-app">
            <div className="text-center">
                {/* Static fallback content for unknown client-side routes. */}
                <h1 className="text-6xl font-extrabold text-emerald mb-4">404</h1>
                <p className="text-xl text-text-secondary mb-6">Page not found</p>
                {/* Redirect users to the main landing route inside authenticated area. */}
                <Link to="/dashboard" className="inline-flex items-center px-6 py-3 rounded-lg bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors">
                    Back to Dashboard
                </Link>
            </div>
        </div>);
}


