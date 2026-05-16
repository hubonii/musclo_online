/**
 * Axios instance configuration and API request helpers.
 */
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';


export const API_URL = import.meta.env.VITE_API_URL || 'https://musclo-online-huboony-5837s-projects.vercel.app';

export const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
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

            useAuthStore.getState().reset();
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 403 && error.response?.data?.needs_verification) {

            if (window.location.pathname !== '/verify-email') {
                window.location.href = '/verify-email';
            }
        }
        if (error.response && error.response.status >= 500) {
            console.error(`Critical API failure [${error.response.status}]:`, error.response.data);
        }

        return Promise.reject(error);
    }
);


/**
 * Helper for performing GET requests with simplified data extraction.
 * @param {string} url - Target API endpoint.
 * @param {Object} [params] - Query parameters.
 * @returns {Promise<any>} Extracted data payload.
 */
export async function apiGet(url, params) {
    const { data } = await apiClient.get(url, { params });

    return data.data ?? data;
}

/**
 * Helper for performing POST requests with simplified data extraction.
 * @param {string} url - Target API endpoint.
 * @param {Object} body - Request body payload.
 * @param {Object} [config] - Axios request configuration.
 * @returns {Promise<any>} Extracted data payload.
 */
export async function apiPost(url, body, config) {
    const { data } = await apiClient.post(url, body, config);
    return data.data ?? data;
}

/**
 * Helper for performing PUT requests with simplified data extraction.
 * @param {string} url - Target API endpoint.
 * @param {Object} body - Request body payload.
 * @returns {Promise<any>} Extracted data payload.
 */
export async function apiPut(url, body) {
    const { data } = await apiClient.put(url, body);
    return data.data ?? data;
}

/**
 * Helper for performing DELETE requests.
 * @param {string} url - Target API endpoint.
 * @returns {Promise<void>}
 */
export async function apiDelete(url) {
    await apiClient.delete(url);
}

/**
 * Extracts validation error messages from an Axios error response.
 * @param {Error} error - The error object to parse.
 * @returns {Object|null} Formatted validation errors or null.
 */
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