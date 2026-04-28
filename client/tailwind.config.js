/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FCFAF6",
          100: "#FAF7F0",
          200: "#F4EEE2",
          300: "#EBE3D2",
        },
        forest: {
          50: "#EAF4EE",
          100: "#CFE5D8",
          200: "#A4CDB4",
          300: "#74B08F",
          400: "#4F9870",
          500: "#3E8C60",
          600: "#2F6F4F",
          700: "#245A3F",
          800: "#1A4530",
          900: "#0F2C1F",
        },
        terracotta: {
          50: "#FBEFE9",
          100: "#F6D5C5",
          200: "#EFB59A",
          300: "#E89478",
          400: "#E07856",
          500: "#D26543",
          600: "#B5512F",
          700: "#8E3F23",
        },
        coral: {
          50: "#FCE8EC",
          100: "#F8C6CD",
          400: "#EE5867",
          500: "#E63946",
          600: "#C82935",
          700: "#A11F2A",
        },
        ink: {
          900: "#0F1419",
          800: "#1F2933",
          700: "#2D3640",
          600: "#475063",
          500: "#6B7280",
          400: "#9AA1AC",
          300: "#C9CFD8",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,20,25,0.04), 0 4px 12px rgba(15,20,25,0.06)",
        card: "0 2px 4px rgba(15,20,25,0.04), 0 12px 32px rgba(15,20,25,0.08)",
        hover: "0 8px 16px rgba(15,20,25,0.06), 0 24px 48px rgba(15,20,25,0.10)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
