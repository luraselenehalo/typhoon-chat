import type { Config } from "tailwindcss";

/**
 * Theme strategy:
 *  - `darkMode: 'class'` — toggled by adding `.dark` to <html>.
 *  - Colors reference CSS variables (RGB triplets, separated by spaces) so
 *    Tailwind's `<alpha-value>` syntax still works (`bg-paper-50/70`).
 *  - The variables live in `app/globals.css`. Component class names stay the
 *    same across themes; only the underlying RGB values change.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds — numeric scale represents elevation/depth, not lightness.
        // paper-50  = most elevated surface (composer card, modal)
        // paper-100 = app canvas (inside the frame)
        // paper-200 = outer frame
        // paper-300 = dividers / soft chips
        // paper-400 = muted lines / disabled rails
        paper: {
          50: "rgb(var(--paper-50) / <alpha-value>)",
          100: "rgb(var(--paper-100) / <alpha-value>)",
          200: "rgb(var(--paper-200) / <alpha-value>)",
          300: "rgb(var(--paper-300) / <alpha-value>)",
          400: "rgb(var(--paper-400) / <alpha-value>)",
        },
        // Foregrounds — 900 is the strongest text, descending in emphasis.
        ink: {
          900: "rgb(var(--ink-900) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        frame: "var(--shadow-frame)",
      },
    },
  },
  plugins: [],
};

export default config;
