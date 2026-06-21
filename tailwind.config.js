/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        ink: "#0a0a0a",
        paper: "#f5f5f5",
        signal: "#00ff9f",
        dim: "#888888",
        line: "#333333",
        panel: "#111111",
      },
    },
  },
  plugins: [],
};
