/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f5f5f6',
          100: '#e6e6e8',
          200: '#d0d0d4',
          300: '#afafb6',
          400: '#868690',
          500: '#6b6b76',
          600: '#5b5b64',
          700: '#4e4e55',
          800: '#444449',
          900: '#16161d',
          950: '#0A0A0F',
        },
        accent: {
          purple: '#7C3AED',
          pink: '#EC4899',
          blue: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #7C3AED, #EC4899, #3B82F6)',
        'gradient-accent-hover': 'linear-gradient(135deg, #6D28D9, #DB2777, #2563EB)',
        'gradient-dark': 'linear-gradient(180deg, #0A0A0F 0%, #16161d 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-spin': 'border-spin 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-spin': {
          '0%': { '--border-angle': '0deg' },
          '100%': { '--border-angle': '360deg' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
