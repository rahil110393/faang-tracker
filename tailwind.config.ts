import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        phase: {
          p1: "#3b82f6",
          p2: "#8b5cf6",
          p3: "#f97316",
          p4: "#10b981",
        },
      },
      keyframes: {
        flame: {
          "0%, 100%": { transform: "scale(1) rotate(-2deg)" },
          "50%": { transform: "scale(1.1) rotate(2deg)" },
        },
      },
      animation: { flame: "flame 1.4s ease-in-out infinite" },
    },
  },
  plugins: [],
} satisfies Config;
