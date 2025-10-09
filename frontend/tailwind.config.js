/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',
        secondary: '#2563EB',
        accent: '#FBBF24',
        background: '#F3F4F6',
        surface: '#FFFFFF',
        error: '#DC2626',
        success: '#16A34A',
        textPrimary: '#111827',
        textSecondary: '#6B7280'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
