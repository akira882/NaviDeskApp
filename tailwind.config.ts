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
        // --- Page backgrounds ---
        ink: "#0d1117",
        "ink-soft": "#131c2a",

        // --- Surface hierarchy (cards > inputs > hover) ---
        "surface-1": "#1a2233",   // card background
        "surface-2": "#1f2a3c",   // input, nested panel
        "surface-3": "#263347",   // hover state
        "surface-muted": "#1f2a3c",

        // --- Borders (all clearly visible on dark) ---
        "line-subtle": "#2d3f58",  // default card border
        "line-mid": "#3a5170",     // stronger border
        "line-strong": "#4e6882",  // active / emphasis

        // --- Text hierarchy (all pass WCAG AA on surface-1) ---
        // text-primary: 14:1 contrast on ink
        "text-primary": "#e8edf4",
        // text-secondary: ~11:1 contrast on ink
        "text-secondary": "#b8cde0",
        // text-muted: ~6.5:1 contrast on surface-1
        "text-muted": "#8faac4",

        // --- Backward-compat aliases ---
        "ghost-white": "#e8edf4",
        "slate-grey": "#b8cde0",
        "slate-dim": "#8faac4",

        // --- Semantic accents ---
        "accent-teal": "#27c4b3",
        "accent-teal-dim": "#1a9e8e",
        "accent-violet": "#7c88f0",
        "accent-violet-dim": "#5b64c4",
        "accent-gold": "#e5a820",
        "accent-crimson": "#f05050",
        "accent-green": "#3ebf6a",
        "accent-blue": "#5898d4"
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(39, 196, 179, 0.07), 0 4px 20px rgba(0, 0, 0, 0.4)",
        "panel-hover": "0 0 0 1px rgba(39, 196, 179, 0.18), 0 8px 28px rgba(0, 0, 0, 0.5)",
        "glow-sm": "0 0 12px rgba(39, 196, 179, 0.22)"
      },
      backgroundImage: {
        "page-grid":
          "linear-gradient(rgba(39, 196, 179, 0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(39, 196, 179, 0.018) 1px, transparent 1px)",
        "hero-gradient": "linear-gradient(135deg, #1c2d42 0%, #0d1117 100%)"
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(3px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
