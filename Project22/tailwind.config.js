/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: '#E8EEF6',
          100: '#C5D4E8',
          200: '#8FA9D1',
          300: '#5A7EBA',
          400: '#3A5F9F',
          500: '#1B2A4A',
          600: '#162240',
          700: '#111A33',
          800: '#0C1226',
          900: '#070A19',
        },
        accent: {
          50: '#FFF0E8',
          100: '#FFDCC8',
          200: '#FFB891',
          300: '#FF945A',
          400: '#FF6B35',
          500: '#E55A25',
          600: '#CC4A16',
          700: '#993710',
          800: '#66250B',
          900: '#331205',
        },
        success: '#22C55E',
        warning: '#FBBF24',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
