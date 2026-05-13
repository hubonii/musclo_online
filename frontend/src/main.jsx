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
    console.log(`[VersionGuard] Updating from ${storedVersion} to ${APP_VERSION}. Clearing cache...`);
    clearAllCache();
    localStorage.clear(); // Nuclear option for persisted stores (Zustand)
    localStorage.setItem('musclo_app_version', APP_VERSION);
    
    // Only reload if this wasn't the first time setting the version
    if (storedVersion) {
        window.location.reload();
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
