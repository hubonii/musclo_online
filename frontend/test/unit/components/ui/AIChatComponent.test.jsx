import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIChatComponent from '../../../../src/components/ui/AIChatComponent';
import { useAIChatStore } from '../../../../src/stores/useAIChatStore';
import { useAuthStore } from '../../../../src/stores/useAuthStore';
import { useWorkoutStore } from '../../../../src/stores/useWorkoutStore';
import { useCreateProgramFromAI } from '../../../../src/hooks/usePrograms';

// --- Mocks ---
jest.mock('../../../../src/stores/useAIChatStore', () => ({
  useAIChatStore: jest.fn(),
}));

jest.mock('../../../../src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../../src/stores/useWorkoutStore', () => ({
  useWorkoutStore: jest.fn(),
}));

jest.mock('../../../../src/hooks/usePrograms', () => ({
  useCreateProgramFromAI: jest.fn(),
}));

jest.mock('react-markdown', () => ({ children }) => <div>{children}</div>);
jest.mock('remark-gfm', () => () => {});

describe('AIChatComponent', () => {
  const mockAIChatStore = {
    isOpen: false,
    messages: [],
    isLoading: false,
    error: null,
    sessions: [],
    currentSessionId: null,
    toggleChat: jest.fn(),
    closeChat: jest.fn(),
    addUserMessage: jest.fn(),
    addAssistantMessage: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    fetchSessions: jest.fn(),
    selectSession: jest.fn(),
    createNewSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAIChatStore.mockReturnValue(mockAIChatStore);
    useAuthStore.mockReturnValue({ isAuthenticated: true });
    useWorkoutStore.mockReturnValue({ isActive: false, exercises: [], routineName: '' });
    useCreateProgramFromAI.mockReturnValue({ mutate: jest.fn(), isLoading: false });
  });

  test('renders chat button when closed', () => {
    render(<AIChatComponent />);
    expect(screen.getByLabelText('Musclo AI')).toBeInTheDocument();
  });

  test('toggles chat open on button click', () => {
    render(<AIChatComponent />);
    fireEvent.click(screen.getByLabelText('Musclo AI'));
    expect(mockAIChatStore.toggleChat).toHaveBeenCalled();
  });

  test('renders chat panel when open', () => {
    useAIChatStore.mockReturnValue({ ...mockAIChatStore, isOpen: true });
    render(<AIChatComponent />);
    expect(screen.getByText('Bodybuilding AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask Musclo AI...')).toBeInTheDocument();
  });

  test('shows history panel when history icon clicked', () => {
    useAIChatStore.mockReturnValue({ ...mockAIChatStore, isOpen: true });
    render(<AIChatComponent />);
    
    // History icon is the first button in the header
    const historyBtn = screen.getAllByRole('button')[0]; 
    fireEvent.click(historyBtn);
    
    expect(screen.getByText('Session Logs')).toBeInTheDocument();
  });

  test('sends message on enter key', async () => {
    useAIChatStore.mockReturnValue({ ...mockAIChatStore, isOpen: true });
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn().mockResolvedValueOnce({ done: true })
        })
      }
    }));

    render(<AIChatComponent />);
    const input = screen.getByPlaceholderText('Ask Musclo AI...');
    
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockAIChatStore.addUserMessage).toHaveBeenCalledWith('Hello AI');
  });

  test('shows "Save to Programs" button when plan detected', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Create a plan' },
      { id: '2', role: 'assistant', content: 'Here is your plan: <workout_plan_json>{"name":"AI Plan","routines":[]}</workout_plan_json>', isStreaming: false }
    ];
    useAIChatStore.mockReturnValue({ ...mockAIChatStore, isOpen: true, messages });
    
    const saveMutate = jest.fn();
    useCreateProgramFromAI.mockReturnValue({ mutate: saveMutate, isLoading: false });

    render(<AIChatComponent />);
    
    const saveBtn = screen.getByText('Save to Programs');
    expect(saveBtn).toBeInTheDocument();
    
    fireEvent.click(saveBtn);
    expect(saveMutate).toHaveBeenCalledWith(expect.objectContaining({ name: 'AI Plan' }));
  });
});
