/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          900: "#312E81",
        },
        region: {
          kerala: "#10B981",  // emerald-500
          india: "#F59E0B",   // amber-500
          global: "#8B5CF6",  // violet-500
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "light-grid": "radial-gradient(#CBD5E1 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        "card-hover": "0 16px 32px -4px rgba(79, 70, 229, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.85)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.03)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        floatSlow: "floatSlow 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
