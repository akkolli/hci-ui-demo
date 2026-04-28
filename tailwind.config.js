/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        glass: "rgba(255,255,255,0.12)",
        glassBorder: "rgba(255,255,255,0.22)",
      },
      boxShadow: {
        window:
          "0 30px 80px -20px rgba(0,0,0,0.55), 0 8px 30px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
        glow: "0 0 40px rgba(255,255,255,0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};
