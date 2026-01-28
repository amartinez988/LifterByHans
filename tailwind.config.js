/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1115",
        haze: "#F6F3EE",
        ember: "#FF6B35",
        pine: "#1B4332",
        clay: "#D4A373"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(15, 17, 21, 0.6)"
      }
    }
  },
  plugins: []
};
