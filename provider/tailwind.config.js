/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        // Kynd brand — butter yellow ramp (primary)
        brand: {
          50:  '#fffaf0',
          100: '#fff2d6',
          200: '#ffe6ad',
          300: '#ffdd8a',
          400: '#ffd76a',
          500: '#f5c542',
          600: '#e6ac1f',
          700: '#c08c16',
          800: '#8f6810',
          900: '#5c430a'
        },
        // Cocoa brown — text / dark surfaces
        cocoa: {
          DEFAULT: '#4a2e1f',
          50:  '#f6f1ee',
          100: '#e7dad2',
          400: '#8a6552',
          600: '#5c3a28',
          700: '#4a2e1f',
          800: '#3a2418',
          900: '#2a1a12'
        },
        cream: '#fff7eb',
        oat:   '#e7ded1',
        warmgrey: '#f2f2f2'
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(74, 46, 31, 0.18)'
      }
    }
  },
  plugins: []
}
