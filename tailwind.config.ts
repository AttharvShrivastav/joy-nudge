import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        pacifico: ['Pacifico', 'cursive'],
      },
      colors: {
        // New Joy Nudge color palette
        'joy-white': '#f1faee',
        'joy-light-blue': '#a8dadc',
        'joy-steel-blue': '#457b9d',
        'joy-dark-blue': '#1d3557',
        'joy-coral': '#e63946',
        
        // Keep some existing colors for compatibility
        peach: "#FFDDAA",
        powder: "#B0E0E6",
        mint: "#CDEAC0",
        lemon: "#FFFACD",
        lavender: "#E6E6FA",
        accent: "#FFA07A",
        joyblue: "#aad6f6",
        joypink: "#FFD6EB",
        joygreen: "#C7F5D9",
        heading: "#1d3557",
        "body": "#1d3557",
        "gray-900": "#1d3557",
        "gray-700": "#457b9d",
        "gray-500": "#6b7280",
      },
      backgroundImage: {
        'joy-gradient': 'linear-gradient(135deg, #f1faee 0%, #a8dadc 50%, #f1faee 100%)',
      },
      boxShadow: {
        'joy': '0 4px 24px 0 rgba(69, 123, 157, 0.13), 0 1.5px 20px 0 rgba(168, 218, 220, 0.14)',
        'joy-card': '0 8px 32px 0 rgba(69, 123, 157, 0.15)',
      },
      keyframes: {
        'sparkle': {
          '0%': { opacity: 0, transform: 'scale(0.5) rotate(0deg)' },
          '60%': { opacity: 1, transform: 'scale(1.2) rotate(12deg)' },
          '100%': { opacity: 0, transform: 'scale(0.6) rotate(24deg)' },
        },
        'button-glow': {
          '0%': { boxShadow: '0 0 0 0 #457b9d' },
          '70%': { boxShadow: '0 0 16px 12px #457b9d33' },
          '100%': { boxShadow: '0 0 0 0 #457b9d' }
        },
        'gentle-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.05)', opacity: 0.8 },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        }
      },
      animation: {
        'sparkle': 'sparkle 1.1s ease-in-out',
        'button-glow': 'button-glow 1.7s infinite',
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
