/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: "#0b0f17",
          850: "#101622",
          800: "#161e2e",
          700: "#222d42",
          600: "#2d3b55",
        },
        tealAccent: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        navyAccent: {
          500: "#3b82f6",
          600: "#2563eb",
        }
      }
    },
  },
  plugins: [],
}
