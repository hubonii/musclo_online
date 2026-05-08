/**
 * Store for managing AI coach chat sessions and message streaming.
 */
import { create } from 'zustand';
import { apiGet, apiDelete } from '../api/axios';

export const useAIChatStore = create()((set, get) => ({
    isOpen: false,
    messages: [],
    sessions: [],
    currentSessionId: null,
    isLoading: false,
    error: null,
    abortController: null,
    selectedModel: 'openai/gpt-oss-120b:free',
    selectedImage: null,
    openChat: () => set({ isOpen: true }),
    closeChat: () => set({ isOpen: false }),
    toggleChat: () => set({ isOpen: !get().isOpen }),
    setSelectedImage: (img) => set({ selectedImage: img }),

    fetchSessions: async () => {
        try {
            const sessions = await apiGet('/chat/sessions');
            set({ sessions });
        }
        catch {
        }
    },
    selectSession: async (id) => {
        set({ isLoading: true, currentSessionId: id, messages: [] });
        try {
            const messages = await apiGet(`/chat/sessions/${id}/messages`);
            set({ messages });
        }
        catch {
            set({ error: 'Failed to load messages' });
        }
        finally {
            set({ isLoading: false });
        }
    },
    createNewSession: async () => {
        set({ messages: [], currentSessionId: null, selectedImage: null });
    },
    deleteSession: async (id) => {
        try {
            await apiDelete(`/chat/sessions/${id}`);
            set({
                sessions: get().sessions.filter(s => s.id !== id),
                currentSessionId: get().currentSessionId === id ? null : get().currentSessionId,
                messages: get().currentSessionId === id ? [] : get().messages
            });
        }
        catch {
        }
    },
    addUserMessage: (content, imageUrl) => {

        set({
            messages: [...get().messages, {
                    id: `u-${Date.now()}`,
                    role: 'user',
                    content,
                    image_url: imageUrl || undefined,
                    timestamp: new Date().toISOString(),
                }],
        });
    },
    addAssistantMessage: (content, thought) => {

        const id = `a-${Date.now()}`;
        set({
            messages: [...get().messages, {
                    id, role: 'assistant', content, thought, timestamp: new Date().toISOString(), isStreaming: true,
                }],
        });
        return id;
    },
    setStreaming: (id, content, thought) => {
        set({
            messages: get().messages.map((m) => m.id === id ? { ...m, content, thought } : m),
        });
    },
    finalizeStreaming: (id) => {
        set({
            messages: get().messages.map((m) => m.id === id ? { ...m, isStreaming: false } : m),
        });

        get().fetchSessions();
    },
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setAbortController: (abortController) => set({ abortController }),
    setSelectedModel: (selectedModel) => set({ selectedModel }),
}));


