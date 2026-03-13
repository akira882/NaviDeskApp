import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17324d",
        "ink-soft": "#34506a",
        "line-subtle": "#d9e2ea",
        "surface-muted": "#f3f6f8",
        "accent-teal": "#0f766e",
        "accent-gold": "#b7791f",
        "accent-crimson": "#9f1239"
      },
      boxShadow: {
        panel: "0 14px 40px rgba(23, 50, 77, 0.08)"
      },
      backgroundImage: {
        "page-grid":
          "linear-gradient(rgba(15, 118, 110, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 118, 110, 0.05) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
