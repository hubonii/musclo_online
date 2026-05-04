// Unit tests for useThemeStore — light/dark mode and system preference sync.
import { useThemeStore } from '../../../src/stores/useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    useThemeStore.setState({ theme: 'dark' });
  });

  test('setTheme applies explicit light and dark theme classes', () => {
    useThemeStore.getState().setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    useThemeStore.getState().setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('setTheme(system) follows matchMedia preference', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    useThemeStore.getState().setTheme('system');

    expect(useThemeStore.getState().theme).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('toggleTheme resolves system mode then flips to opposite theme', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    useThemeStore.setState({ theme: 'system' });

    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});


