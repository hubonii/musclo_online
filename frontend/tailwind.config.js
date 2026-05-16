// Tailwind theme tokens mapped to CSS variables from the design system.
import typography from '@tailwindcss/typography';

export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                app: 'var(--bg-app)',
                surface: 'var(--bg-surface)',
                divider: 'var(--border-divider)',
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                emerald: 'var(--accent-emerald)',
                primary: 'var(--accent-primary)',
                tertiary: 'var(--accent-tertiary)',
                'on-primary': 'var(--text-on-primary)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
                zinc: {
                    50: 'oklch(98% 0.01 250)',
                    100: 'oklch(96% 0.01 250)',
                    800: 'oklch(27% 0.01 250)',
                    900: 'oklch(20% 0.01 250)',
                    950: 'oklch(15% 0.01 250)',
                }
            },
            fontFamily: {
                sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Bricolage Grotesque', 'sans-serif'],
                mono: ['Geist Mono', 'monospace'],
            },
            borderRadius: {
                sm: '8px',
                md: '12px',
                lg: '20px',
                xl: '28px',
                '2xl': '36px',
                '3xl': '48px',
                full: '9999px',
            },
            transitionTimingFunction: {
                DEFAULT: 'cubic-bezier(0.25, 1, 0.5, 1)',
                'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
                'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
                'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            animation: {
                shimmer: 'shimmer 1.5s infinite linear',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
            },
        },
    },
    plugins: [typography],
};
