/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        },
        shift: {
          work: '#38bdf8',
          workBg: '#082f49',
          workBorder: '#0284c7',
          rest: '#34d399',
          restBg: '#064e3b',
          restBorder: '#059669',
          extra: '#fbbf24',
          extraBg: '#451a03',
          extraBorder: '#d97706',
          off: '#94a3b8',
          offBg: '#1e293b',
          offBorder: '#475569',
        },
      },
    },
  },
  plugins: [],
}
