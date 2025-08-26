/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5B4FB6",
        secondary: "#7C6FD8",
        accent: "#6BCF7F",
        surface: "#F7F5FF",
        success: "#6BCF7F",
        warning: "#FFB547",
        error: "#FF6B6B",
        info: "#4ECDC4",
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'timer-pulse': 'timer-pulse 2s infinite',
        'count-up': 'count-up 0.3s ease-out',
      },
      keyframes: {
        'timer-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        'count-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}