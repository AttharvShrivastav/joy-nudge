
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
        peach: "#FFDDAA",
        powder: "#B0E0E6",
        mint: "#CDEAC0",
        lemon: "#FFFACD",
        lavender: "#E6E6FA",
        accent: "#FFA07A",
        joyblue: "#aad6f6",
        joypink: "#FFD6EB",
        joygreen: "#C7F5D9",
        heading: "#252525",
        "body": "#22292f",
        "gray-900": "#18181b",
        "gray-700": "#374151",
        "gray-500": "#6b7280",
      },
      backgroundImage: {
        'joy-gradient': 'linear-gradient(135deg, #FFFACD 0%, #FFDDAA 50%, #B0E0E6 100%)',
      },
      boxShadow: {
        'joy': '0 4px 24px 0 rgba(255, 221, 170, 0.13), 0 1.5px 20px 0 rgba(186, 225, 210, 0.14)'
      },
      keyframes: {
        'sparkle': {
          '0%': { opacity: 0, transform: 'scale(0.5) rotate(0deg)' },
          '60%': { opacity: 1, transform: 'scale(1.2) rotate(12deg)' },
          '100%': { opacity: 0, transform: 'scale(0.6) rotate(24deg)' },
        },
        'button-glow': {
          '0%': { boxShadow: '0 0 0 0 #FFDDAA' },
          '70%': { boxShadow: '0 0 16px 12px #FFDDAA99' },
          '100%': { boxShadow: '0 0 0 0 #FFDDAA' }
        }
      },
      animation: {
        'sparkle': 'sparkle 1.1s ease-in-out',
        'button-glow': 'button-glow 1.7s infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
