import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "terminal de datos deportiva" (version con mas contraste).
        ink: {
          950: "#0c111b",
          900: "#151c2a",
          800: "#212a3b",
          700: "#313c52",
          600: "#4a5874",
          500: "#94a3bd",
        },
        accent: {
          DEFAULT: "#c8ff00",
          dim: "#9fcc00",
          soft: "#e6ff80",
        },
        signal: {
          win: "#3ee07f",
          draw: "#ffc23d",
          loss: "#ff6b6b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
