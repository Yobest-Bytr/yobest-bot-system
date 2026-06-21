/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./app/**/*.{js,jsx}",
  "./components/**/*.{js,jsx}",
  "./lib/**/*.{js,jsx}",
],
  theme: {
    extend: {
      colors: {
        ink:    "#08090b",
        panel:  "#0f1318",
        raised: "#161c23",
        line:   "#1e2630",
        signal: "#00e5a0",
        amber:  "#f5a623",
        ember:  "#ff5c35",
        paper:  "#e8edf2",
        muted:  "#6b7a8d",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono:    ["var(--font-mono)",    "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in":    "fadeIn 0.3s ease forwards",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } },
      },
    },
  },
  plugins: [],
};
