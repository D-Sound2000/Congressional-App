/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for your diabetes app
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#1976d2',
          600: '#1565c0',
          700: '#0d47a1',
        },
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          500: '#388e3c',
          600: '#2e7d32',
        },
        warning: {
          50: '#fff3e0',
          100: '#ffe0b2',
          500: '#fbc02d',
          600: '#f57c00',
        },
        danger: {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#e65100',
          600: '#d32f2f',
        },
        dark: {
          50: '#f6f8fa',
          100: '#e3e6ea',
          200: '#c7ccd4',
          300: '#9aa0a8',
          400: '#6d737c',
          500: '#404650',
          600: '#333a45',
          700: '#262d3a',
          800: '#1a202f',
          900: '#0d1324',
        }
      },
      fontFamily: {
        'system': ['System', 'sans-serif'],
      },
      borderRadius: {
        'xl': '22px',
        '2xl': '26px',
      },
      shadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 4px 10px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
} 