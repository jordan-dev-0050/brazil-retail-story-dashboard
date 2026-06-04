import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2A44',
        slate: '#5C6B82',
        mist: '#F4F7FB',
        line: '#D9E2EF',
        accent: {
          blue: '#3A86F6',
          teal: '#4DB98A',
          orange: '#FF9D3F',
          navy: '#264E86',
        },
      },
      boxShadow: {
        panel: '0 28px 60px -34px rgba(29, 53, 87, 0.24)',
        soft: '0 16px 36px -28px rgba(41, 72, 122, 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Aptos', '"Segoe UI"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
