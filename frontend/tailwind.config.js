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
                orange: 'var(--accent-orange)',
                tertiary: 'var(--accent-tertiary)',
                'on-emerald': 'var(--text-on-primary)',
                'on-orange': 'var(--text-on-secondary)',
                success: 'var(--success)',
                warning: 'var(--warning)',
                danger: 'var(--danger)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
