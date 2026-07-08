/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          500: "#2a78d6",
          600: "#1f5fb0",
          700: "#194f95",
        },
      },
    },
  },
  plugins: [],
};
