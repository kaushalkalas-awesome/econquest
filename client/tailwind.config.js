/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        eq: {
          primary: '#3B82F6',
          primaryDark: '#1D4ED8',
          secondary: '#10B981',
          accent: '#F59E0B',
          pink: '#EC4899',
          danger: '#EF4444',
          darkest: '#050B14',
          dark: '#0B1120',
          card: 'rgba(30, 41, 59, 0.4)',
          cardHover: 'rgba(51, 65, 85, 0.5)',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
