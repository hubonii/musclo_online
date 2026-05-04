// Global auth store (session state + auth actions).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, apiGet, apiPost } from '../api/axios';

export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthenticating: false,
    isInitializing: false,

    login: async (email, password) => {
        set({ isAuthenticating: true });
        try {
            const responseData = await apiPost('/login', { email, password });
            const userData = responseData.user || responseData.data?.user || responseData;
            const token = responseData.token || responseData.data?.token;
            if (token) localStorage.setItem('musclo-token', token);
            set({ user: userData, isAuthenticated: true });
        } finally {
            set({ isAuthenticating: false });
        }
    },

    register: async (name, email, password, password_confirmation) => {
        set({ isAuthenticating: true });
        try {
            const responseData = await apiPost('/register', { name, email, password, password_confirmation });
            const userData = responseData.user || responseData.data?.user || responseData;
            const token = responseData.token || responseData.data?.token;
            if (token) localStorage.setItem('musclo-token', token);
            set({ user: userData, isAuthenticated: true });
        } finally {
            set({ isAuthenticating: false });
        }
    },

    logout: async () => {
        try {
            await apiClient.post('/logout');
        } catch {
            // Clear anyway
        }
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('musclo-auth');
        localStorage.removeItem('musclo-token');
        
        // Also clear any response cache entries to prevent data leak
        const { clearAllCache } = await import('../lib/offlineCache');
        clearAllCache();
    },

    fetchUser: async () => {
        if (get().isInitializing) return;
        set({ isInitializing: true });
        try {
            const user = await apiGet('/user');
            set({ user, isAuthenticated: !!user });
        } catch {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isInitializing: false });
        }
    },

    resendVerification: async () => {
        set({ isLoading: true });
        try {
            await apiPost('/resend-verification');
        } finally {
            set({ isLoading: false });
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true });
        try {
            await apiPost('/verify-email', { code });
            const user = await apiGet('/user');
            set({ user });
        } finally {
            set({ isLoading: false });
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
            await apiPost('/forgot-password', { email });
        } finally {
            set({ isLoading: false });
        }
    },

    resetPassword: async (email, code, password) => {
        set({ isLoading: true });
        try {
            await apiPost('/reset-password', { email, code, password });
        } finally {
            set({ isLoading: false });
        }
    },

    updateProfile: async (data) => {
        set({ isLoading: true });
        try {
            const response = await apiClient.put('/profile', data);
            const updatedUser = response.data?.data || response.data;
            if (updatedUser) {
                set({ user: updatedUser });
            }
            return updatedUser;
        } finally {
            set({ isLoading: false });
        }
    },

    updateAvatar: async (file) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await apiClient.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Support both data.avatar_url and direct response
            const avatar_url = response.data?.data?.avatar_url || response.data?.avatar_url;
            if (avatar_url) {
                set(state => ({ user: { ...state.user, avatar_url } }));
            }
            return avatar_url;
        } catch (error) {
            throw error;
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
            await apiClient.post('/change-password', { currentPassword, newPassword });
        } finally {
            set({ isLoading: false });
        }
    },

    requestEmailChange: async (newEmail) => {
        set({ isLoading: true });
        try {
            await apiClient.post('/profile/request-email-change', { newEmail });
        } finally {
            set({ isLoading: false });
        }
    },

    verifyEmailChange: async (code) => {
        set({ isLoading: true });
        try {
            const response = await apiClient.post('/profile/verify-email-change', { code });
            const updatedEmail = response.data?.data?.email || response.data?.email;
            if (updatedEmail) {
                set(state => ({ user: { ...state.user, email: updatedEmail } }));
            }
        } finally {
            set({ isLoading: false });
        }
    },

    deleteAccount: async (password) => {
        set({ isLoading: true });
        try {
            await apiClient.delete('/profile/delete', { data: { password } });
            // Logout after deletion triggers full cleanup
            await get().logout();
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () => set({ user: null, isAuthenticated: false }),
}), {
    name: 'musclo-auth',
    partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
    })
}));