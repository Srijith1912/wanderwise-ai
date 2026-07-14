/** @type {import('tailwindcss').Config} */

// All palette scales resolve through CSS variables (defined in index.css) so a
// single `.dark` class on <html> re-themes the entire app — no per-component
// dark: variants needed. Variables hold "R G B" triplets to keep /opacity
// modifiers (e.g. bg-forest-600/50) working.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (key, steps) =>
  Object.fromEntries(steps.map((s) => [s, v(`${key}-${s}`)]));

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: scale("cream", [50, 100, 200, 300]),
        forest: scale("forest", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        terracotta: scale("terracotta", [50, 100, 200, 300, 400, 500, 600, 700]),
        coral: scale("coral", [50, 100, 400, 500, 600, 700]),
        blossom: scale("blossom", [50, 100, 200, 300, 400, 500, 600, 700]),
        ink: scale("ink", [300, 400, 500, 600, 700, 800, 900]),
        // Fixed near-black for photo scrims/backdrops — identical in both themes,
        // so images stay legible when the palette flips.
        night: "#141009",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "Cambria", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,16,9,0.05), 0 4px 12px rgba(20,16,9,0.07)",
        card: "0 2px 4px rgba(20,16,9,0.05), 0 12px 32px rgba(20,16,9,0.09)",
        hover: "0 8px 16px rgba(20,16,9,0.07), 0 24px 48px rgba(20,16,9,0.12)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
