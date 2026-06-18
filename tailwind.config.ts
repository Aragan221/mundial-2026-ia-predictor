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
        // Paleta "terminal de datos deportiva"
        ink: {
          950: "#05070a",
          900: "#0a0e14",
          800: "#11161f",
          700: "#1a212d",
          600: "#262f3d",
          500: "#3a4556",
        },
        accent: {
          DEFAULT: "#c8ff00",
          dim: "#9fcc00",
          soft: "#e6ff80",
        },
        signal: {
          win: "#33d17a",
          draw: "#f5b942",
          loss: "#ff5c5c",
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
