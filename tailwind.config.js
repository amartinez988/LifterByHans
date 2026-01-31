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
        // Legacy colors (keep for compatibility)
        ink: "#0F1115",
        haze: "#F6F3EE",
        ember: "#FF6B35",
        pine: "#1B4332",
        clay: "#D4A373",
        // Brand colors
        brand: {
          50: "#EEF4FF",
          100: "#D9E5FF",
          200: "#B8CFFF",
          300: "#8BB2FF",
          400: "#5B8EFF",
          500: "#3B6BF7",
          600: "#2952E8",
          700: "#1E3FCA",
          800: "#1A35A3",
          900: "#1A3282",
          950: "#131F4F"
        },
        accent: {
          50: "#FFF4ED",
          100: "#FFE6D5",
          200: "#FFCBA8",
          300: "#FFA96B",
          400: "#FF7E2E",
          500: "#FF6B35",
          600: "#F04B12",
          700: "#C73A0D",
          800: "#9E3013",
          900: "#7F2A14",
          950: "#451208"
        },
        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22"
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03"
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          950: "#450A0A"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(15, 17, 21, 0.6)",
        glow: "0 0 20px -5px rgba(59, 107, 247, 0.4)",
        "glow-accent": "0 0 20px -5px rgba(255, 107, 53, 0.4)"
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #3B6BF7 0%, #2952E8 100%)",
        "gradient-accent": "linear-gradient(135deg, #FF6B35 0%, #F04B12 100%)",
        "mesh-pattern": "radial-gradient(circle at 1px 1px, rgba(59, 107, 247, 0.08) 1px, transparent 0)"
      },
      backgroundSize: {
        "mesh": "24px 24px"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" }
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
