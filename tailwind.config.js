/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/renderer/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4f46e5",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
