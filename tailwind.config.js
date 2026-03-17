/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fff5',
          100: '#b3ffe0',
          200: '#80ffcc',
          300: '#4dffb8',
          400: '#1affa3',
          500: '#00FF88',
          600: '#00cc6d',
          700: '#009952',
          800: '#006637',
          900: '#00331c',
        },
      },
    },
  },
  plugins: [],
};
