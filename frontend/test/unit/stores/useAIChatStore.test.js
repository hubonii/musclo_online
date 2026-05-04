// Unit tests for useAIChatStore — session management and LLM chat state.
import { useAIChatStore } from '../../../src/stores/useAIChatStore';
import { apiDelete, apiGet } from '../../../src/api/axios';

jest.mock('../../../src/api/axios', () => ({
  apiGet: jest.fn(),
  apiDelete: jest.fn(),
}));

describe('useAIChatStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAIChatStore.setState({
      isOpen: false,
      messages: [],
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null,
      abortController: null,
      modelMode: 'fast',
      selectedImage: null,
    });
  });

  test('open/close/toggle update chat visibility', () => {
    useAIChatStore.getState().openChat();
    expect(useAIChatStore.getState().isOpen).toBe(true);

    useAIChatStore.getState().toggleChat();
    expect(useAIChatStore.getState().isOpen).toBe(false);

    useAIChatStore.getState().closeChat();
    expect(useAIChatStore.getState().isOpen).toBe(false);
  });

  test('fetchSessions stores sessions on success', async () => {
    apiGet.mockResolvedValue([{ id: 1, title: 'Session 1' }]);

    await useAIChatStore.getState().fetchSessions();

    expect(apiGet).toHaveBeenCalledWith('/chat/sessions');
    expect(useAIChatStore.getState().sessions).toEqual([{ id: 1, title: 'Session 1' }]);
  });

  test('selectSession loads messages and resets loading flag', async () => {
    apiGet.mockResolvedValue([{ id: 'm1', role: 'assistant', content: 'Hi' }]);

    await useAIChatStore.getState().selectSession(9);

    expect(apiGet).toHaveBeenCalledWith('/chat/sessions/9/messages');
    expect(useAIChatStore.getState().currentSessionId).toBe(9);
    expect(useAIChatStore.getState().messages).toHaveLength(1);
    expect(useAIChatStore.getState().isLoading).toBe(false);
  });

  test('selectSession sets user-facing error when request fails', async () => {
    apiGet.mockRejectedValue(new Error('boom'));

    await useAIChatStore.getState().selectSession(3);

    expect(useAIChatStore.getState().error).toBe('Failed to load messages');
    expect(useAIChatStore.getState().isLoading).toBe(false);
  });

  test('deleteSession removes session and clears selected messages when needed', async () => {
    useAIChatStore.setState({
      sessions: [{ id: 4 }, { id: 5 }],
      currentSessionId: 4,
      messages: [{ id: 'm1' }],
    });

    await useAIChatStore.getState().deleteSession(4);

    expect(apiDelete).toHaveBeenCalledWith('/chat/sessions/4');
    expect(useAIChatStore.getState().sessions).toEqual([{ id: 5 }]);
    expect(useAIChatStore.getState().currentSessionId).toBeNull();
    expect(useAIChatStore.getState().messages).toEqual([]);
  });

  test('assistant streaming flow updates message and refreshes sessions', async () => {
    apiGet.mockResolvedValue([{ id: 99, title: 'Updated title' }]);

    const assistantId = useAIChatStore.getState().addAssistantMessage('Partial', 'Thinking');
    useAIChatStore.getState().setStreaming(assistantId, 'Final answer', 'Done');
    useAIChatStore.getState().finalizeStreaming(assistantId);

    await Promise.resolve();

    const assistant = useAIChatStore.getState().messages.find((m) => m.id === assistantId);
    expect(assistant.content).toBe('Final answer');
    expect(assistant.thought).toBe('Done');
    expect(assistant.isStreaming).toBe(false);
    expect(apiGet).toHaveBeenCalledWith('/chat/sessions');
  });
});


