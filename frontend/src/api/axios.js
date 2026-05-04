import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

// Ensure the URL in Vercel starts with https://
export const API_URL = import.meta.env.VITE_API_URL || 'https://musclo-nodejs-production.up.railway.app';

export const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // Required for sending/receiving cookies/sessions
    timeout: 60000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('musclo-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Reset auth state if the session expires
            useAuthStore.getState().reset();
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 403 && error.response?.data?.needs_verification) {
            // Redirect to verification page if email is not confirmed
            if (window.location.pathname !== '/verify-email') {
                window.location.href = '/verify-email';
            }
        }

        // REMOVED: 419 handler and getCsrfCookie (Laravel specific)

        if (error.response && error.response.status >= 500) {
            console.error(`Critical API failure [${error.response.status}]:`, error.response.data);
        }

        return Promise.reject(error);
    }
);

// Helper functions for API requests
export async function apiGet(url, params) {
    const { data } = await apiClient.get(url, { params });
    // Returns data.data if wrapped, otherwise returns data directly
    return data.data ?? data;
}

export async function apiPost(url, body, config) {
    const { data } = await apiClient.post(url, body, config);
    return data.data ?? data;
}

export async function apiPut(url, body) {
    const { data } = await apiClient.put(url, body);
    return data.data ?? data;
}

export async function apiDelete(url) {
    await apiClient.delete(url);
}

export function getValidationErrors(error) {
    if (
        axios.isAxiosError(error) &&
        error.response?.status === 422 &&
        error.response?.data?.errors
    ) {
        return error.response.data;
    }
    return null;
}