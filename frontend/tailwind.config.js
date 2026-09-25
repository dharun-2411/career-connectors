/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          50: '#f5f7ff',
          100: '#eef2ff',
          200: '#e0e7ff',
          300: '#c7d2fe',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50: '#faf5ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        canvas: '#f8fafc',
        card: '#ffffff',
        borderSubtle: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'nexus-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'nexus': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        'nexus-md': '0 8px 24px 0 rgba(0, 0, 0, 0.07)',
        'nexus-lg': '0 16px 36px -4px rgba(0, 0, 0, 0.08)',
        'nexus-pill': '0 2px 6px 0 rgba(79, 70, 229, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

