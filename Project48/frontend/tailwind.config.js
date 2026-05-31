/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F3FF',
          100: '#C6DCFF',
          200: '#9DC2FF',
          300: '#72A8FF',
          400: '#4C8EFF',
          500: '#165DFF',
          600: '#0E42D2',
          700: '#0A2BA6',
          800: '#061A7A',
          900: '#030E4E'
        },
        warning: {
          50: '#FFF4E6',
          100: '#FFE3C2',
          200: '#FFCF99',
          300: '#FFBA70',
          400: '#FFA647',
          500: '#FF7D00',
          600: '#CC6400',
          700: '#994B00',
          800: '#663200',
          900: '#331900'
        },
        danger: {
          50: '#FFECE8',
          100: '#FFCDC4',
          200: '#FFA99B',
          300: '#FF8571',
          400: '#FF6148',
          500: '#F53F3F',
          600: '#CB2634',
          700: '#A11228',
          800: '#77071C',
          900: '#4D0310'
        },
        success: {
          50: '#E8FFEA',
          100: '#C2FFC7',
          200: '#99FFA1',
          300: '#70FF7B',
          400: '#47FF55',
          500: '#00B42A',
          600: '#009A2F',
          700: '#007D2B',
          800: '#005F24',
          900: '#00421A'
        }
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
