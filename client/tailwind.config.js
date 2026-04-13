/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        thread: {
          bg: '#0f1115',
          card: '#181b21',
          border: '#2a2f3a',
          muted: '#8b939e',
          accent: '#ff4500',
          up: '#ff8b60',
          down: '#9494ff',
        },
      },
    },
  },
  plugins: [],
};
