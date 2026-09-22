import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec2ff',
          400: '#59a1ff',
          500: '#337dff',
          600: '#1e5cf5',
          700: '#1848e1',
          800: '#1a3cb6',
          900: '#1b378f',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;