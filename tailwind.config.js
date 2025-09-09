/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#e8f2ff",
          500: "#667eea",
          600: "#5a67d8",
          700: "#4c51bf",
        },
        success: {
          500: "#38ef7d",
          600: "#11998e",
        },
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};
