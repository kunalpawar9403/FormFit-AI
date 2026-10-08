/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './frontend/index.html',
    './frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '.theme-dark'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5500',
          hover: '#E84D00',
          subtle: '#FFF1EB',
          border: '#FED7C3',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
