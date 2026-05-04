// Frontend entry: apply saved/system theme before the first render.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { useThemeStore } from './stores/useThemeStore';

const theme = useThemeStore.getState().theme;

if (theme === 'system') {
    // Applies OS color-scheme preference before React mount.
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
} else {
    document.documentElement.classList.toggle('dark', theme === 'dark');
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
