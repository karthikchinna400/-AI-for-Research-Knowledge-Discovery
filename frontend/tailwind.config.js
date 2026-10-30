/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a6f6',
          500: '#0c8be8',
          600: '#026fc7',
          700: '#0358a1',
          800: '#074b85',
          900: '#0c3f6e',
          950: '#082849'
        },
        navy: {
          800: '#111827',
          900: '#0b0f19',
          950: '#070a10'
        }
      }
    }
  },
  plugins: []
};

