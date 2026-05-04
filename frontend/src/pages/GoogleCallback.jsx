import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const handleHandshake = () => {
            try {
                if (token) {
                    // 1. Storage fallback (very reliable)
                    localStorage.setItem('musclo-token', token);
                    
                    // 2. Direct message (faster if it works)
                    if (window.opener) {
                        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token }, "*");
                    }
                }
            } catch (err) {
                console.error('Handshake failed:', err);
            }
            
            // Close as fast as possible
            window.close();
            // Fallback close
            setTimeout(() => window.close(), 200);
        };

        handleHandshake();
    }, [token]);

    // Return null as requested - completely invisible
    return null;
}
