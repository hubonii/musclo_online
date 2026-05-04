// Theme preference store (light/dark/system) with DOM class sync.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useThemeStore = create()(persist((set, get) => ({
    theme: 'dark',
    toggleTheme: () => {
        const current = get().theme;
        let resolved = current;
        if (current === 'system') {
            // Resolve system mode first, then toggle from the resolved value.
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        const next = resolved === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
    },
    setTheme: (theme) => {
        set({ theme });
        if (theme === 'system') {
            // Applies current OS color-scheme when theme value is `system`.
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', isDark);
        }
        else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    },
}), { name: 'musclo-theme' }));


