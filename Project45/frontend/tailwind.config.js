/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fcecd7',
          200: '#f8d4ae',
          300: '#f3b77b',
          400: '#ed9046',
          500: '#e97222',
          600: '#da5818',
          700: '#b54116',
          800: '#90351a',
          900: '#742e18',
        },
        heritage: {
          red: '#C41E3A',
          gold: '#D4AF37',
          jade: '#00A86B',
          ink: '#1A1A2E',
          paper: '#F5F0E6',
          wood: '#8B4513',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif SC', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
