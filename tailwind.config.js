/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  // Dark theme is forced via CSS overrides in index.css
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
        teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
        slate: { 850: '#172033', 950: '#0B1120' },
        glass: 'rgba(255,255,255,0.1)',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.3)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.3)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
