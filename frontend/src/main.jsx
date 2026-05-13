// Frontend entry: apply saved/system theme before the first render.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { useThemeStore } from './stores/useThemeStore';
import { APP_VERSION } from './lib/constants';
import { clearAllCache } from './lib/offlineCache';

const theme = useThemeStore.getState().theme;

if (theme === 'system') {
    // Applies OS color-scheme preference before React mount.
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
} else {
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Version Guard: Forces cache clearance and reload if the app version has changed.
const storedVersion = localStorage.getItem('musclo_app_version');
if (storedVersion !== APP_VERSION) {
    console.log(`[VersionGuard] Updating from ${storedVersion} to ${APP_VERSION}. Nuclear cache purge...`);
    
    // Clear all possible web storage types
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB (used by some libraries or service workers)
    if (window.indexedDB && window.indexedDB.databases) {
        window.indexedDB.databases().then(dbs => {
            dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
        });
    }

    localStorage.setItem('musclo_app_version', APP_VERSION);
    
    // Force a hard reload to fetch new JS bundles
    if (storedVersion) {
        window.location.href = window.location.origin + window.location.pathname + '?v=' + APP_VERSION;
    }
}

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// React 19 entrypoint mount.
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </StrictMode>
);
