import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ivory: {
          50: "#FDFCF7",
          100: "#FAF8EF",
          200: "#F5F0DC",
          300: "#EDE4C3",
          400: "#DDD3A5",
          500: "#C9BC82",
        },
        obsidian: {
          900: "#0A0907",
          800: "#141210",
          700: "#1E1B17",
          600: "#2A2620",
          500: "#3A352C",
        },
        gold: {
          300: "#E8D5A3",
          400: "#D4B86A",
          500: "#C4A24A",
          600: "#A88835",
          700: "#8B6F27",
        },
        rose: {
          950: "#2D0A12",
          900: "#5C1A26",
          800: "#8B2D3F",
          700: "#B84057",
          600: "#D4526B",
        },
      },
      backgroundImage: {
        "grain": "url('/noise.svg')",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
